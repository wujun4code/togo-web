/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { PassThrough } from "node:stream";

import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import CssBaseline from '@mui/material/CssBaseline';
import type { AppLoadContext, EntryContext } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream, renderToString } from "react-dom/server";
import createEmotionCache from './components/create.emotion.cache';

import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import { getDataFromTree } from "@apollo/client/react/ssr";
import type { ReactElement } from "react";

const ABORT_DELAY = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadContext: AppLoadContext
) {
  return isbot(request.headers.get("user-agent") || "")
    ? handleBotRequest(
      request,
      responseStatusCode,
      responseHeaders,
      remixContext
    )
    : handleBrowserRequest(
      request,
      responseStatusCode,
      responseHeaders,
      remixContext
    );
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return new Promise(async (resolve, reject) => {
    let shellRendered = false;
    const emotionCache = createEmotionCache();
    const { extractCriticalToChunks } = createEmotionServer(emotionCache);

    function App() {
      return (<CacheProvider value={emotionCache}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <RemixServer context={remixContext} url={request.url} abortDelay={ABORT_DELAY} />
      </CacheProvider>);
    }
    const apolloApp = await wrapRemixServerWithApollo(<App />, request);
    const html = renderToString(apolloApp);
    const { styles } = extractCriticalToChunks(html);
    let stylesHTML = '';

    styles.forEach(({ key, ids, css }) => {
      const emotionKey = `${key} ${ids.join(' ')}`;
      const newStyleTag = `<style data-emotion="${emotionKey}">${css}</style>`;
      stylesHTML = `${stylesHTML}${newStyleTag}`;
    });
  
    // Add the Emotion style tags after the insertion point meta tag
    const markup = html.replace(
      /<meta(\s)*name="emotion-insertion-point"(\s)*content="emotion-insertion-point"(\s)*\/>/,
      `<meta name="emotion-insertion-point" content="emotion-insertion-point"/>${stylesHTML}`,
    );
  
    responseHeaders.set('Content-Type', 'text/html');
  
    resolve(new Response(`<!DOCTYPE html>${markup}`, {
      status: responseStatusCode,
      headers: responseHeaders,
    }));
    // const { pipe, abort } = renderToPipeableStream(await wrapRemixServerWithApollo(<App />, request),
    //   {
    //     onShellReady() {
    //       shellRendered = true;

    //       const reactBody = new PassThrough();
    //       const emotionServer = createEmotionServer(emotionCache);

    //       const bodyWithStyles = emotionServer.renderStylesToNodeStream();
    //       reactBody.pipe(bodyWithStyles);

    //       const stream = createReadableStreamFromReadable(reactBody);

    //       responseHeaders.set("Content-Type", "text/html");

    //       resolve(
    //         new Response(stream, {
    //           headers: responseHeaders,
    //           status: responseStatusCode,
    //         })
    //       );

    //       pipe(reactBody);
    //     },
    //     onShellError(error: unknown) {
    //       reject(error);
    //     },
    //     onError(error: unknown) {
    //       responseStatusCode = 500;
    //       // Log streaming rendering errors from inside the shell.  Don't log
    //       // errors encountered during initial shell rendering since they'll
    //       // reject and get logged in handleDocumentRequest.
    //       if (shellRendered) {
    //         console.error(error);
    //       }
    //     },
    //   }
    // );

    // setTimeout(abort, ABORT_DELAY);
  });
}

async function wrapRemixServerWithApollo(
  remixServer: ReactElement,
  request: Request,
) {
  const client = await getApolloClient(request);

  const app = <ApolloProvider client={client}>{remixServer}</ApolloProvider>;

  await getDataFromTree(app);
  const initialState = client.extract();

  const appWithData = (
    <>
      {app}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__APOLLO_STATE__=${JSON.stringify(
            initialState,
          ).replace(/</g, "\\u003c")}`, // The replace call escapes the < character to prevent cross-site scripting attacks that are possible via the presence of </script> in a string literal
        }}
      />
    </>
  );
  return appWithData;
}

async function getApolloClient(request: Request) {
  const client = new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache(),
    link: createHttpLink({
      uri: 'http://localhost:3000/graphql',
      headers: {
        ...Object.fromEntries(request.headers),
      },
      credentials: request.credentials ?? "include", // or "same-origin" if your backend server is the same domain
    }),
  });
  return client;
}