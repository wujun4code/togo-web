import React, { createContext, useContext, useRef, useEffect, ReactNode } from 'react';

// 定义主题上下文
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

// 创建一个自定义 hook，用于订阅和发布事件
export const useTopic = () => {
    const context = useContext(TopicContext);
    if (!context) {
        throw new Error('useTopic must be used within a TopicProvider');
    }
    return context;
};

// 创建一个组件提供者，用于管理事件的订阅和发布
export const TopicProvider = ({ children }: { children: ReactNode }) => {
    // 存储订阅信息的引用
    const subscriptionsRef = useRef<{ [key: string]: { [key: string]: ((message: any) => void)[] } }>({});

    // 订阅主题
    const on = (topic: string, event: string, callback: (message: any) => void) => {
        if (!subscriptionsRef.current[topic]) {
            subscriptionsRef.current[topic] = {};
        }
        if (!subscriptionsRef.current[topic][event]) {
            subscriptionsRef.current[topic][event] = [];
        }
        subscriptionsRef.current[topic][event].push(callback);
    };

    // 取消订阅主题
    const off = (topic: string, event: string, callback: (message: any) => void) => {
        if (subscriptionsRef.current[topic] && subscriptionsRef.current[topic][event]) {
            subscriptionsRef.current[topic][event] = subscriptionsRef.current[topic][event].filter(cb => cb !== callback);
        }
    };

    // 发布消息
    const pub = (topic: string, event: string, message: any) => {
        if (subscriptionsRef.current[topic] && subscriptionsRef.current[topic][event]) {
            subscriptionsRef.current[topic][event].forEach(cb => cb(message));
        }
    };

    // 将订阅和发布函数传递给子组件
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
