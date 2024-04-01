import { useEffect, useState } from 'react';
import { AsyncLoaderState } from '../hooks';

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

        const { data } = await response.json();
        return data;
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

export function useMutation(serverUrl: string, mutation: string, queryName: string, variables?: any, headers?: any) {

    const initData = {};
    const [data, setData] = useState(initData as any);
    const [hookState, setHookState] = useState<AsyncLoaderState>(AsyncLoaderState.Init);

    const mutateData = async (variables: any) => {

        setHookState(AsyncLoaderState.Loading);
        try {
            const rootData = await execute(serverUrl, mutation, variables, headers);
            if (queryName in rootData) {
                console.log('✅ graphql mutation');
                setData(rootData[queryName]);
                setHookState(AsyncLoaderState.Loaded);
            }
            else {
                setHookState(AsyncLoaderState.Failed);
            }
        }
        catch (error) {
            setHookState(AsyncLoaderState.Failed);
        }
        finally {
            //setHookState(AsyncLoaderState.Init);
        }
    };

    const loading = hookState === AsyncLoaderState.Loading;

    const succeeded = hookState === AsyncLoaderState.Loaded;

    const init = hookState === AsyncLoaderState.Init;

    return { mutateData, data, hookState, loading, succeeded, init };
}

export function useGraphQL({ serverUrl, gql, queryName, variables, headers, }:
    { serverUrl: string, gql: string, queryName: string, variables?: any, headers?: any, }) {

    const initData = {};
    const [data, setData] = useState(initData);
    const [hookState, setHookState] = useState<AsyncLoaderState>(AsyncLoaderState.Init);

    useEffect(() => {

        const fetchData = async () => {

            setHookState(AsyncLoaderState.Loading);
            try {
                const rootData = await execute(serverUrl, gql, variables, headers);
                if (queryName in rootData) {
                    console.log('✅ graphql fetched data.');
                    setData(rootData[queryName]);
                    setHookState(AsyncLoaderState.Loaded)
                }
                else {
                    setHookState(AsyncLoaderState.Failed);
                }
            }
            catch (error) {
                setHookState(AsyncLoaderState.Failed);
            }
        };

        fetchData();

        return () => {
            setHookState(AsyncLoaderState.Loaded);
        };

    }, [serverUrl]);

    return { data, hookState };
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