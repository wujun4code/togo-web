import { useEffect, useState, useRef, createContext, ReactNode, useContext } from 'react';
import { AsyncLoaderState, GraphqlErrorCode, useWebSocket, useTopic } from '@hooks';
import { useOutletContext } from "@remix-run/react";
import { IClientContext, getGqlHeaders } from "@contracts";
import { v4 as uuidv4 } from 'uuid';
import { logEnv } from '@services';

export const execute = async (serverUrl: string, gql: string, variables?: any, headers?: any) => {

    try {
        const response = await fetch(serverUrl, {
            method: 'POST',
            credentials: 'same-origin',
            headers: headers ? {
                ...headers,
                "Content-Type": "application/json",
            } : { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: gql,
                variables: variables ? variables : undefined,
            }),
        });

        const res = await response.json();
        return res;
    }
    catch (error) {
        console.error(error);
        return {};
    }
}

export function useAsyncAction(action: (input: any) => Promise<any>) {
    const [data, setData] = useState<any>(null);
    const [hookState, setHookState] = useState<AsyncLoaderState>(AsyncLoaderState.Init);

    // 定义异步执行函数
    const executeAction = async (input: any) => {
        setHookState(AsyncLoaderState.Loading);
        try {
            const result = await action(input);
            setData(result);
            setHookState(AsyncLoaderState.Loaded);
        } catch (error) {
            setHookState(AsyncLoaderState.Failed);
        }
    };

    return { executeAction, data, hookState };
}

export function useDataGraphql(gql: string) {
    const context = useOutletContext<IClientContext>();
    return useGraphql(context.dataSources.graphql.serverUrl, gql, getGqlHeaders(context.user));
}

export function useDataQuery(query: string) {
    const { executeGraphql, data, hookState, loading, succeeded, error } = useDataGraphql(query);

    return { query: executeGraphql, data, hookState, loading, succeeded, error };
}

export function useDataMutation(mutation: string) {
    const { executeGraphql, data, hookState, loading, succeeded, error } = useDataGraphql(mutation);

    return { mutation: executeGraphql, data, hookState, loading, succeeded, error };
}

export function useGraphql(serverUrl: string, gql: string, headers?: any) {

    const [data, setData] = useState<any>(undefined as any);
    const [hookState, setHookState] = useState<AsyncLoaderState>(AsyncLoaderState.Init);
    const [error, setError] = useState<GraphqlErrorCode | undefined>(undefined);

    const executeGraphql = async (variables?: any) => {

        let rootData = undefined as any;
        setHookState(AsyncLoaderState.Loading);
        try {
            const { data: response, errors } = await execute(serverUrl, gql, variables, headers);
            if (!errors) {
                console.log('✅ graphql');
                rootData = response;
                setData(response);
                setHookState(AsyncLoaderState.Loaded);
                return rootData;
            }
            else {
                setHookState(AsyncLoaderState.Failed);
                if (errors?.[0]?.extensions?.code) {
                    setError(errors?.[0]?.extensions?.code);
                }
            }
        }
        catch (error) {
            setHookState(AsyncLoaderState.Failed);
        }
        finally {
            return rootData;
        }
    };
    const loading = hookState === AsyncLoaderState.Loading;

    const succeeded = hookState === AsyncLoaderState.Loaded;

    return { executeGraphql, data, hookState, loading, succeeded, error };
}

export function useMutation(serverUrl: string, mutation: string, headers?: any) {

    const { executeGraphql, data, hookState, loading, succeeded, error } = useGraphql(serverUrl, mutation, headers);

    return { mutateData: executeGraphql, data, hookState, loading, succeeded, error };
}

export function useQuery(serverUrl: string, query: string, headers?: any) {

    const { executeGraphql, data, hookState, loading, succeeded, error } = useGraphql(serverUrl, query, headers);

    return { query: executeGraphql, data, hookState, loading, succeeded, error };
}

interface SubscriptionProps {
    children: ReactNode;
}

export const SubscriptionContext = createContext<{ subscriptionsRef: React.MutableRefObject<Map<string, boolean>> | null }>({ subscriptionsRef: null });

export const SubscriptionProvider: React.FC<SubscriptionProps> = ({ children }) => {
    const subscriptionsRef = useRef<Map<string, boolean>>(new Map<string, boolean>());

    return (
        <SubscriptionContext.Provider value={{ subscriptionsRef }}>
            {children}
        </SubscriptionContext.Provider>
    );
};


export function useSubscription(
    serverUrl: string,
    subscription: string,
    subscribedKey?: string,
    notificationKey?: string,
    variables?: any,
    onNextData?: (data: any) => void,
    headers?: any) {

    const connectionInit = {
        "type": "connection_init",
        "payload": {
            ...headers,
        }
    };

    const { subscriptionsRef } = useContext(SubscriptionContext);
    if (!subscriptionsRef) return;

    //console.log(subscribedKey, 'useSubscription', 'called');
    const { pub, on, off } = useTopic();
    const [data, setData] = useState<any>(undefined as any);

    const subscription_connection_ack_callback = (payload: any) => {
        const { sendMessage } = payload;
        const subscribePayload = {
            name: subscribedKey,
            id: uuidv4(),
            payload: {
                query: subscription,
                ...(variables && {
                    variables: variables
                }),
            },
            type: 'subscribe'
        };
        if (sendMessage) {
            sendMessage(subscribePayload);
        }
    };

    useWebSocket({
        serverUrl,
        onOpenMessage: connectionInit,
        onConnected: (sendMessage: (message: any) => void) => {
            if (subscribedKey) {
                if (!subscriptionsRef.current.has(subscribedKey)) {
                    const subscribePayload = {
                        name: subscribedKey,
                        id: uuidv4(),
                        payload: {
                            query: subscription,
                            ...(variables && {
                                variables: variables
                            }),
                        },
                        type: 'subscribe'
                    };
                    sendMessage(subscribePayload);
                    subscriptionsRef.current.set(subscribedKey, true);
                }
                if (onNextData) {
                    console.log('notificationKey', notificationKey);
                    on(subscribedKey, 'next', notificationKey ? notificationKey : subscribedKey, onNextData);
                }
            }
        },
        onMessage: (sendMessage: (message: any) => void, eventData: any) => {
            //console.log('onMessage', eventData);
            if ('type' in eventData) {
                const { type } = eventData;
                if (type === 'connection_ack') {
                    console.log('subscription', 'connection_ack');
                    pub('subscription', 'connection_ack', { sendMessage, ...eventData });
                }
                else if (type === 'next') {
                    const { payload: { data } } = eventData;
                    //console.log('subscription', 'next', data);

                    const dataKeys = Object.keys(data);
                    for (const key of dataKeys) {
                        pub(key, 'next', data[key]);
                        if (key === subscribedKey) {
                            setData(data);
                        }
                    }
                }
            }
        }
    });


    // useEffect(() => {
    //     const connection_ack_callback = (payload: any) => {
    //         console.log('useEffect', 'subscription', 'connection_ack');
    //     };
    //     on('subscription', 'connection_ack', connection_ack_callback);
    //     return () => {
    //         off('subscription', 'connection_ack', connection_ack_callback);
    //     };
    // }, [on]);


    return { data };
}

// export function useSubscription(serverUrl: string,
//     subscription: string,
//     variables?: any,
//     headers?: any) {

//     const { ws, sendMessage } = useWebSocket(serverUrl, ['graphql-transport-ws'], {
//         "type": "connection_init",
//         "payload": {
//             ...headers,
//         }
//     });

//     const { on, off } = useTopic();

//     useEffect(() => {
//         const callback = (payload: any) => {
//             const subscriptionId = uuidv4();
//             const subscribePayload = {
//                 id: subscriptionId,
//                 payload: {
//                     query: subscription,
//                     ...(variables && {
//                         variables: variables
//                     }),
//                 },
//                 type: 'subscribe'
//             };
//             sendMessage(subscribePayload);
//         };
//         on('websocket', 'connection_ack', callback);
//         return () => {
//             off('websocket', 'connection_ack', callback);
//         };
//     }, [on]);
// }



export function useChatRoom({ serverUrl, roomId }: { serverUrl: string, roomId: string }) {

    const [connected, setConnected] = useState<boolean>(false);

    useEffect(() => {
        const connection = createConnection(serverUrl, roomId);
        connection.connect();
        setConnected(true);
        return () => {
            connection.disconnect();
            setConnected(false);
        };
    }, [roomId, serverUrl]);

    return connected;
}


export function createConnection(serverUrl: string, roomId: string) {
    // A real implementation would actually connect to the server
    return {
        connect() {
            console.log('✅ Connecting to "' + roomId + '" room at ' + serverUrl + '...');
        },
        disconnect() {
            console.log('❌ Disconnected from "' + roomId + '" room at ' + serverUrl);
        }
    };
}