import { Button, Image, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ButtonGroup, TimelineCards, Typing, NavProfile } from '../components';
import { ClientContextValue, LoaderContext, ServerContextValue, IClientContext, IUserContext } from '../contracts';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ClientLoaderFunctionArgs } from "@remix-run/react";

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

}

interface IndexClientLoaderContext extends IndexLoaderContext {
  user: IUserContext;
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<IndexLoaderContext> {

  const serverContext = new ServerContextValue();
  const clientContext = new ClientContextValue(serverContext);
  const cookie = request.headers.get("Cookie");
  const url = new URL(request.url);
  const location = url.searchParams.get("location");

  return { server: serverContext };
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
          user: user
        };
      }
    }
  }
  catch {

  }

  return clientData;
};

export default function Index() {
  const clientData = useLoaderData<typeof clientLoader>();
  const { server, user } = clientData;
  const context = new ClientContextValue(server);
  context.user = user;

  console.log(`context.user:${JSON.stringify(context)}`);
  const [currentUser, setCurrentUser] = useState<IUserContext | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await context.services.oauth2.logIn(context);
        if (response)
          setCurrentUser(response);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchData();
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
        <NavProfile currentUser={currentUser} setCurrentUser={setCurrentUser} />
      </Navbar>
      <main className="relative flex container mx-auto max-w-7xl z-10 px-6 p-4">
        <div className="flex basis-1/4 ">
          <ButtonGroup className="flex flex-col gap-4" buttons={
            [
              { id: 1, label: 'Home', startIcon: 'home' },
            ]} ></ButtonGroup>
        </div>
        <div className="basis-1/2 flex flex-col gap-2">
          <Typing />
          <TimelineCards clientContext={context} />
        </div>
      </main>
    </>
  );
}
