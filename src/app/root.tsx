import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./tailwind.css";
import { authenticator } from "./services/server/auth";
import { ClientContextValue, LoaderContext, ServerContextValue, IClientContext, IUserContext, IServerContext } from './contracts';
import { syncMyProfile } from './services/server';
import { useUserState, UserProvider, useDataSource, LoadingState, useTopic } from '@hooks';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLoaderData } from "@remix-run/react";
import { useNavigate } from 'react-router-dom';

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] :
    [{ rel: "stylesheet", href: styles },]),
];

export async function loader(args: LoaderFunctionArgs): Promise<IServerContext> {
  const { request } = args;

  const user = await authenticator.isAuthenticated(request);

  const serverContext = new ServerContextValue();

  if (user !== null)
    await syncMyProfile(args, serverContext, user);

  return serverContext;
}

export default function App() {
  const serverData = useLoaderData<typeof loader>();
  const context = new ClientContextValue(serverData);
  const { currentUser, setCurrentUser, loadingState, setLoadingState } = useUserState();
  const { dataSourceConfig, setDataSourceConfig } = useDataSource();
  const { on, off } = useTopic();
  const navigate = useNavigate();
  useEffect(() => {
    if (serverData.user) {
      setCurrentUser(serverData.user);
    }
    if (serverData.dataSourceConfig) {
      setDataSourceConfig(serverData.dataSourceConfig);
    }

    const onRequiredLogIn = (payload: any) => {
      return navigate("/login");
    };
    on('require', 'login', onRequiredLogIn);
    return () => {
      off('require', 'login', onRequiredLogIn);
    };

  }, []);
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
