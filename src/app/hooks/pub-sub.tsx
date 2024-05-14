import React, { createContext, useContext, useRef, useEffect, ReactNode, useCallback } from 'react';

interface TopicContextType {
    on: (topic: string, event: string, id: string, callback: (message: any) => void) => void;
    off: (topic: string, event: string, id: string, callback: (message: any) => void) => void;
    pub: (topic: string, event: string, message: any) => void;
}

const defaultTopicContext = {
    on: () => { },
    off: () => { },
    pub: () => { }
};

export const TopicContext = createContext<TopicContextType | null>(defaultTopicContext);

export const useTopic = () => {
    const context = useContext(TopicContext);
    if (!context) {
        throw new Error('useTopic must be used within a TopicProvider');
    }
    return context;
};

export const TopicProvider = ({ children }: { children: ReactNode }) => {

    const subscriptionMapRef = useRef<{ [key: string]: { [key: string]: { [key: string]: ((message: any) => void)[] } } }>({});
    const subscriptionsRef = useRef<{ [key: string]: { [key: string]: ((message: any) => void)[] } }>({});
    const callbacksRef = useRef(new Map<string, { topic: string, event: string, callback: (message: any) => void }>());

    const on = useCallback((topic: string, event: string, id: string, callback: (message: any) => void) => {

        const callbackId = id + '-' + callback.toString();
        if (!subscriptionMapRef.current[topic]) {
            subscriptionMapRef.current[topic] = {};
        }
        if (!subscriptionMapRef.current[topic][event]) {
            subscriptionMapRef.current[topic][event] = {};
        }
        if (!subscriptionMapRef.current[topic][event][id]) {
            subscriptionMapRef.current[topic][event][id] = [];
        }

        if (Array.isArray(subscriptionMapRef.current[topic][event][id])
            && subscriptionMapRef.current[topic][event][id].length > 0) {
            subscriptionMapRef.current[topic][event][id] = subscriptionMapRef.current[topic][event][id].filter(cb => cb.toString() !== callback.toString());
        }

        subscriptionMapRef.current[topic][event][id].push(callback);

        // if (!callbacksRef.current.has(callbackId)) {
        //     subscriptionsRef.current[topic][event].push(callback);

        //     const existingCallbacks = subscriptionsRef.current[topic][event];
        //     if (!existingCallbacks.some(cb => cb.toString() === callback.toString())) {
        //         subscriptionsRef.current[topic][event].push(callback);
        //         console.log(topic, event, 'subscriptionsRef.current[topic][event].length', subscriptionsRef.current[topic][event].length);
        //     }
        // }
    }, []);

    const off = (topic: string, event: string, id: string, callback: (message: any) => void) => {
        if (subscriptionMapRef.current[topic]
            && subscriptionMapRef.current[topic][event]
            && subscriptionMapRef.current[topic][event][id]) {
            subscriptionMapRef.current[topic][event][id] = subscriptionMapRef.current[topic][event][id].filter(cb => cb.toString() !== callback.toString());
        }
    };

    const pub = (topic: string, event: string, message: any) => {
        if (subscriptionMapRef.current[topic] && subscriptionMapRef.current[topic][event]) {
            const subscriberIds = subscriptionMapRef.current[topic][event];
            const ids = Object.keys(subscriberIds);
            for (const key of ids) {
                const subscribers = subscriberIds[key];
                subscribers.forEach(cb => cb(message));
            }
        }
    };

    const value: TopicContextType = {
        on,
        off,
        pub
    };

    return (
        <TopicContext.Provider value={value}>
            {children}
        </TopicContext.Provider>
    );
};
