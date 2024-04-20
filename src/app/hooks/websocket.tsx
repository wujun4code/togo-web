import React, { createContext, useContext, useRef, useCallback, ReactNode, useEffect, useState } from 'react';
import { useOutletContext } from "@remix-run/react";
import { IClientContext, getGqlHeaders } from "@contracts";
import { useTopic, useDataSource } from '@hooks';

export interface WebSocketProps {
    serverUrl: string;
    onOpenMessage?: any;
    onConnected?: (sendMessage: (message: any) => void) => void;
    onMessage?: (sendMessage: (message: any) => void, eventData: any) => void;
}

export interface WebSocketContextType {
    subscribe: (topic: string, callback: (message: any) => void) => void;
    unsubscribe: (topic: string, callback: (message: any) => void) => void;
    publish: (topic: string, message: any) => void;
    sendMessage: (message: any) => void;
    closeWebSocket: () => void;
    connectWebSocket: (config: WebSocketProps) => void;
    initializeWebSocket: (config: WebSocketProps) => void;
}

const defaultWebSocketContext = {
    subscribe: () => { },
    unsubscribe: () => { },
    publish: () => { },
    sendMessage: () => { },
    closeWebSocket: () => { },
    connectWebSocket: () => { },
    initializeWebSocket: () => { },
};

export const WebSocketContext = createContext<WebSocketContextType | null>(defaultWebSocketContext);

export const useWebSocket = (config: WebSocketProps) => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    context.initializeWebSocket(config);
    return context;
};

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const context = useOutletContext<IClientContext>();
    const { pub, on } = useTopic();
    const webSocketRef = useRef<WebSocket | null>(null);
    const subscriptionsRef = useRef<{ [topic: string]: ((message: any) => void)[] }>({});
    const initializedRef = useRef<boolean>(false);
    const [config, setConfig] = useState<WebSocketProps | null>(null);

    const connectWebSocket = ({ serverUrl, onOpenMessage, onConnected, onMessage }: WebSocketProps) => {
        console.log('try to connect...');
        const ws = new WebSocket(serverUrl, ['graphql-transport-ws']);

        ws.onopen = () => {
            console.log('WebSocket connected');
            if (onOpenMessage) {
                ws.send(JSON.stringify(onOpenMessage));
            }
            // if (onConnected) {
            //     onConnected(sendMessage);
            // }
            pub('websocket', 'connected', { serverUrl: serverUrl });
        };

        ws.onmessage = (event) => {
            const eventData = JSON.parse(event.data)
            console.log('WebSocket message received: ', eventData);
            pub('websocket', 'message', {
                serverUrl: serverUrl,
                ...event.data
            });
            if (onMessage)
                onMessage(sendMessage, eventData);
        };

        ws.onclose = () => {
            console.log('❌ WebSocket connection closed');
            pub('websocket', 'closed', {
                serverUrl: serverUrl
            });
        };

        webSocketRef.current = ws;
    };

    const subscribe = (topic: string, callback: (message: any) => void) => {
        if (!subscriptionsRef.current[topic]) {
            subscriptionsRef.current[topic] = [];
        }
        subscriptionsRef.current[topic].push(callback);
    };

    const unsubscribe = (topic: string, callback: (message: any) => void) => {
        if (subscriptionsRef.current[topic]) {
            subscriptionsRef.current[topic] = subscriptionsRef.current[topic].filter(cb => cb !== callback);
        }
    };

    const publish = (topic: string, message: any) => {
        if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
            webSocketRef.current.send(JSON.stringify({ topic, message }));
        }
    };

    const sendMessage = useCallback((message: any) => {
        console.log(webSocketRef, webSocketRef.current?.readyState);
        if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
            console.log('sendMessage: ', message);
            webSocketRef.current.send(JSON.stringify(message));
        }
    }, []);

    const closeWebSocket = useCallback(() => {
        if (webSocketRef.current) {
            webSocketRef.current.close();
        }
    }, []);

    const initializeWebSocket = (config: WebSocketProps) => {
        if (!initializedRef.current && config.serverUrl) {
            connectWebSocket(config);
            initializedRef.current = true;
        } else if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {

            if (config.onConnected) {
                config.onConnected(sendMessage);
            }
        }
    };
    
    const value: WebSocketContextType = {
        initializeWebSocket,
        connectWebSocket,
        subscribe,
        unsubscribe,
        publish,
        sendMessage,
        closeWebSocket,
    };
    
    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};
