import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { RemixBrowser } from '@remix-run/react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ClientStyleContext from './components/client.style.context';
import createEmotionCache from './components/create.emotion.cache';
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
interface ClientCacheProviderProps {
  children: React.ReactNode;
}
function ClientCacheProvider({ children }: ClientCacheProviderProps) {
  const [cache, setCache] = React.useState(createEmotionCache());

  const clientStyleContextValue = React.useMemo(
    () => ({
      reset() {
        setCache(createEmotionCache());
      },
    }),
    [],
  );



  return (
    <ClientStyleContext.Provider value={clientStyleContextValue}>
      <CacheProvider value={cache}>{children}</CacheProvider>
    </ClientStyleContext.Provider>

  );
}

const hydrate = () => {
  React.startTransition(() => {
    const client = new ApolloClient({
      //@ts-ignore
      cache: new InMemoryCache().restore(window.__APOLLO_STATE__),
      uri: 'http://localhost:3000'
    });
    ReactDOM.hydrateRoot(
      document,
      <ApolloProvider client={client}>
        <ClientCacheProvider>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <RemixBrowser />

        </ClientCacheProvider>
      </ApolloProvider>,
    );
  });
};

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  setTimeout(hydrate, 1);
}
