import { useEffect, useState } from 'react';
import { AsyncLoaderState, GraphqlErrorCode } from '@hooks';

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