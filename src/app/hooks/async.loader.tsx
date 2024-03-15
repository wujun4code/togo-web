import React, { createContext, useContext, useState, useEffect } from 'react';

import { AsyncLoaderState } from './contratcs';

export interface AsyncLoaderContextType<T> {
    loadingState: AsyncLoaderState;
    data: T | null;
}

export const AsyncLoaderContext = createContext<AsyncLoaderContextType<any> | null>(null);

export function useAsyncLoader<T>(load?: () => Promise<T>) {

    const [loadingState, setLoadingState] = useState<AsyncLoaderState>(AsyncLoaderState.Init);
    const [data, setData] = useState<T | null>(null);

    useEffect(() => {
        if (!load) return;
        if (loadingState === AsyncLoaderState.Loading) return;
        setLoadingState(AsyncLoaderState.Loading);
        load()
            .then((result) => {
                setData(result);
                setLoadingState(AsyncLoaderState.Loaded);
            })
            .catch((error) => {
                console.error('Error loading data:', error);
                setLoadingState(AsyncLoaderState.Failed);
            });
    }, [load]);

    return { loadingState, data };
};

interface Props {
    children: React.ReactNode;
    load?: () => Promise<any>;
}

export const AsyncLoaderProvider = ({ children, load }: Props) => {
    const { loadingState, data } = useAsyncLoader(load);

    return (
        <AsyncLoaderContext.Provider value={{ loadingState, data }}>
            {children}
        </AsyncLoaderContext.Provider>
    );
};

export const useAsyncLoaderData = () => {
    const context = useContext(AsyncLoaderContext);
    if (!context) {
        throw new Error('useAsyncLoaderData must be used within an AsyncLoaderProvider');
    }
    return context;
};
