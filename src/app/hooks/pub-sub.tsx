import React, { createContext, useContext, useRef, useEffect, ReactNode } from 'react';

interface TopicContextType {
    on: (topic: string, event: string, callback: (message: any) => void) => void;
    off: (topic: string, event: string, callback: (message: any) => void) => void;
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

    
    const on = (topic: string, event: string, callback: (message: any) => void) => {
        if (!subscriptionsRef.current[topic]) {
            subscriptionsRef.current[topic] = {};
        }
        if (!subscriptionsRef.current[topic][event]) {
            subscriptionsRef.current[topic][event] = [];
        }
        subscriptionsRef.current[topic][event].push(callback);
    };

    const off = (topic: string, event: string, callback: (message: any) => void) => {
        if (subscriptionsRef.current[topic] && subscriptionsRef.current[topic][event]) {
            subscriptionsRef.current[topic][event] = subscriptionsRef.current[topic][event].filter(cb => cb !== callback);
        }
    };

    const pub = (topic: string, event: string, message: any) => {
        if (subscriptionsRef.current[topic] && subscriptionsRef.current[topic][event]) {
            subscriptionsRef.current[topic][event].forEach(cb => cb(message));
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
