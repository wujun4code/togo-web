import { useEffect, useState } from 'react';
import { AsyncLoaderState } from '../hooks';

export const execute = async (serverUrl: string, gql: string, variables?: any, headers?: any) => {
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

export function useGraphQL({ serverUrl, gql, queryName, variables, headers, }:
    { serverUrl: string, gql: string, queryName: string, variables?: any, headers?: any, }) {

    const initData = {};

    console.log('useGraphQL->new');

    const [data, setData] = useState(initData);

    const [hookState, setHookState] = useState<AsyncLoaderState>(AsyncLoaderState.Init);

    useEffect(() => {

        console.log('useGraphQL->useEffect');
        const fetchData = async () => {
            console.log('useGraphQL->fetchData');
            const rootData = await execute(serverUrl, gql, variables, headers);
            console.log('✅ graphql fetched data.');
            if (queryName in rootData) {
                setData(rootData[queryName]);
            }
            setHookState(AsyncLoaderState.Loaded);
        };

        if (hookState === AsyncLoaderState.Loading) return;
        setHookState(AsyncLoaderState.Loading);
        fetchData();

        return () => {
            setHookState(AsyncLoaderState.Loaded);
        };

    }, []);

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




