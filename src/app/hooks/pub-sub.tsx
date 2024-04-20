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

    const subscriptionsRef = useRef<{ [key: string]: { [key: string]: ((message: any) => void)[] } }>({});
    const callbacksRef = useRef(new Map<string, { topic: string, event: string, callback: (message: any) => void }>());

    const on = useCallback((topic: string, event: string, id: string, callback: (message: any) => void) => {
        const callbackId = id + '-' + callback.toString();

        if (callbacksRef.current.has(callbackId)
            && Array.isArray(subscriptionsRef.current[topic][event])
            && subscriptionsRef.current[topic][event].length > 0) {
            subscriptionsRef.current[topic][event] = subscriptionsRef.current[topic][event].filter(cb => cb.toString() !== callback.toString());
            callbacksRef.current.delete(callbackId);
        }

        if (!callbacksRef.current.has(callbackId)) {
            callbacksRef.current.set(callbackId, { topic, event, callback });
            if (!subscriptionsRef.current[topic]) {
                subscriptionsRef.current[topic] = {};
            }
            if (!subscriptionsRef.current[topic][event]) {
                subscriptionsRef.current[topic][event] = [];
            }
            subscriptionsRef.current[topic][event].push(callback);
            console.log(topic, event, 'subscriptionsRef.current[topic][event].length', subscriptionsRef.current[topic][event].length);
            const existingCallbacks = subscriptionsRef.current[topic][event];
            if (!existingCallbacks.some(cb => cb.toString() === callback.toString())) {
                subscriptionsRef.current[topic][event].push(callback);
                console.log(topic, event, 'subscriptionsRef.current[topic][event].length', subscriptionsRef.current[topic][event].length);
            }
        }
    }, []);

    const off = (topic: string, event: string, id: string, callback: (message: any) => void) => {

        const callbackId = id + '-' + callback.toString();
        if (callbacksRef.current.has(callbackId)) {
            const { topic, event } = callbacksRef.current.get(callbackId)!;
            if (subscriptionsRef.current[topic] && subscriptionsRef.current[topic][event]) {
                subscriptionsRef.current[topic][event] = subscriptionsRef.current[topic][event].filter(cb => cb !== callback);
            }
            callbacksRef.current.delete(callbackId);
        }
    };

    const pub = (topic: string, event: string, message: any) => {
        if (subscriptionsRef.current[topic] && subscriptionsRef.current[topic][event]) {
            const subscribers = subscriptionsRef.current[topic][event];
            console.log('subscribers', subscribers.length);
            subscribers.forEach(cb => cb(message));
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
