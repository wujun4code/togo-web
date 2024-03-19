import { Button, Image, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ButtonGroup, TimelineCards, Typing, NavProfile } from '../components';
import { ClientContextValue, LoaderContext, ServerContextValue, IClientContext, IUserContext } from '../contracts';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { useUserState, UserProvider, useDataSource, LoadingState } from '../hooks/index';
import { getAuth, loadUser, getTrendingFeed, getTimeline } from '../services/.server';

export const links: LinksFunction = () => [
  {
    rel: "preload",
    href: "/logo-blue.svg",
    as: "image",
    type: "image/svg+xml",
  }
];

export const meta: MetaFunction = () => {
  return [
    { title: "ToGo" },
    { name: "description", content: "Welcome to Towa!" },
  ];
};

interface IndexLoaderContext extends LoaderContext {
  posts: any;
}

interface IndexClientLoaderContext extends IndexLoaderContext {
  user: IUserContext;
}

export async function loader(args: LoaderFunctionArgs): Promise<IndexLoaderContext> {
  const { request } = args;

  const serverContext = new ServerContextValue();
  const clientContext = new ClientContextValue(serverContext);
  const cookie = request.headers.get("Cookie");
  const url = new URL(request.url);
  const location = url.searchParams.get("location");

  await loadUser(args, serverContext);

  const trendingFeed = serverContext.user ? await getTimeline(args, serverContext) : await getTrendingFeed(args, serverContext);

  return { server: serverContext, posts: trendingFeed };
}

export const clientLoader = async ({
  request,
  params,
  serverLoader,
}: ClientLoaderFunctionArgs): Promise<IndexClientLoaderContext> => {

  // call the server loader
  const serverData = await serverLoader();
  const clientData: IndexClientLoaderContext = serverData as IndexClientLoaderContext;
  const { server } = clientData;
  const context = new ClientContextValue(server);

  try {
    const oauth2Token = await context.dataSources.oauth2.getToken(context, 'oauth2/auth');

    if (oauth2Token && oauth2Token.accessToken) {

      const oauth2User = context.services.oauth2.decode(oauth2Token.accessToken);
      const toGoUser = await context.services.oauth2.fetchToGoUser(context);
      if (toGoUser) {

        const user = {
          accessToken: oauth2Token.accessToken,
          oauth2: oauth2User,
          togo: toGoUser
        };

        return {
          server: server,
          user: user,
          posts: clientData.posts
        };
      }
    }
  }
  catch {

  }

  return clientData;
};

export default function Index() {
  const serverData = useLoaderData<typeof loader>();

  // console.log(`serverData.user:${JSON.stringify(serverData.server.user)}`);

  const clientData = useLoaderData<typeof clientLoader>();

  const { server, user } = clientData;

  // console.log(`clientData.user:${JSON.stringify(user)}`);

  const context = new ClientContextValue(server);

  if (serverData.server.user) {
    context.user = serverData.server.user;
  }
  if (user) {
    context.user = user;
  }

  const { currentUser, setCurrentUser, loadingState, setLoadingState } = useUserState();

  const { dataSourceConfig, setDataSourceConfig } = useDataSource();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await context.services.oauth2.logIn(context);
        if (response) {
          //setCurrentUser(response);
          setCurrentUser(response);
          setLoadingState(LoadingState.Loaded);
        }

      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    if (context.user) {
      setCurrentUser(context.user);
      setLoadingState(LoadingState.Loaded);
    }
    if (server.dataSourceConfig) {
      setDataSourceConfig(server.dataSourceConfig);
    }
    //fetchData();
  }, []);
  return (
    <>
      <Navbar className="bg-white rounded-lg shadow-lg dark:bg-slate-800 dark:text-slate-400 dark:highlight-white/5" maxWidth="xl">
        <NavbarBrand className="flex">
          <Image
            className="size-16"
            alt="Towa Logo"
            src="/logo-blue.svg"
          />
          <p className="font-bold text-inherit">ToGo</p>
        </NavbarBrand>
        <NavbarContent>
          <NavbarItem className="flex flex-row items-center justify-between gap-2">
          </NavbarItem>
        </NavbarContent>
        <NavProfile />
      </Navbar>
      <main className="relative flex container mx-auto max-w-7xl z-10 px-6 p-4">
        <div className="flex basis-1/4 ">
          <ButtonGroup className="flex flex-col gap-4" buttons={
            [
              { id: 1, label: 'Home', startIcon: 'home' },
            ]} >
          </ButtonGroup>
        </div>
        <div className="basis-1/2 flex flex-col gap-2">
          <Typing currentUser={context.user} />
          <TimelineCards serverUrlX={serverData.server.dataSourceConfig.graphql.serverUrl}
            data={serverData.posts}
            currentUser={context.user} />
        </div>
      </main>
    </>
  );
}
