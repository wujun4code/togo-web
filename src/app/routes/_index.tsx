import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ButtonGroup, TimelineCards, Typing, NavProfile, NavHeader, NavLinksPanel } from '@components';
import { ClientContextValue, LoaderContext, ServerContextValue, IClientContext, IUserContext } from '../contracts';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { useUserState, UserProvider, useDataSource, LoadingState } from '../hooks/index';
import { syncMyProfile, getTrendingFeed, getTimeline } from '../services/server';
import { authenticator } from "../services/server/auth";
import { NavLinks } from '@components';
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

  const user = await authenticator.isAuthenticated(request);

  const serverContext = new ServerContextValue();

  // const cookie = request.headers.get("Cookie");
  // const url = new URL(request.url);
  // const location = url.searchParams.get("location");

  if (user !== null)
    await syncMyProfile(args, serverContext, user);

  const rootQuery = serverContext.user ? await getTimeline(args, serverContext) : await getTrendingFeed(args, serverContext);

  return { server: serverContext, posts: rootQuery.posts };
}

// export const clientLoader = async ({
//   request,
//   params,
//   serverLoader,
// }: ClientLoaderFunctionArgs): Promise<IndexClientLoaderContext> => {


//   return clientData;
// };

export default function Index() {
  const serverData = useLoaderData<typeof loader>();

  // console.log(`serverData.user:${JSON.stringify(serverData.server.user)}`);

  // const clientData = useLoaderData<typeof clientLoader>();

  const { server } = serverData;

  // console.log(`clientData.user:${JSON.stringify(user)}`);

  const context = new ClientContextValue(server);

  const { currentUser, setCurrentUser, loadingState, setLoadingState } = useUserState();

  const { dataSourceConfig, setDataSourceConfig } = useDataSource();
  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await context.services.oauth2.logIn(context);
        // if (response) {
        //   //setCurrentUser(response);
        //   setCurrentUser(response);
        //   setLoadingState(LoadingState.Loaded);
        // }

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
      <NavHeader />
      <main className="relative flex container mx-auto max-w-7xl z-10 px-6 p-4">
        <div className="flex basis-1/4 ">
          {/* <ButtonGroup className="flex flex-col gap-4" buttons={
            [
              { id: 1, label: 'Home', startIcon: 'home' },
              { id: 2, label: 'Profile', startIcon: 'avatar', linkTo: server.user ? `/${server.user?.togo.snsName}` : '/login' },
            ]} >
          </ButtonGroup> */}

          <NavLinksPanel context={context} />

        </div>
        <div className="basis-1/2 flex flex-col gap-2 max-w-2xl">
          <Typing currentUser={context.user} />
          <TimelineCards serverUrlX={serverData.server.dataSourceConfig.graphql.serverUrl}
            data={serverData.posts}
            currentUser={context.user} />
        </div>
      </main>
    </>
  );
}
