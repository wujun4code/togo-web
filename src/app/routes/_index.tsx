import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { NavItems, NavAction } from '../components/nav/header';
import { Image } from "@nextui-org/react";
import type { LinksFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { City, Now, ClientContext, ClientContextValue, LoaderContext, ServerContextValue, ServerContext } from '../contracts';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@nextui-org/react";
import React from "react";
import { Textarea } from "@nextui-org/react";
import { ButtonGroup, Typing, PostCard, TimelineCards } from '../components';


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

export default function Index() {
  const loaderContext = useLoaderData<typeof loader>();

  const { server } = loaderContext;
  const context = new ClientContextValue(server);

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
        <NavbarContent justify="end">
          <NavbarItem className="hidden lg:flex">
            <Link href="#">Login</Link>
          </NavbarItem>
          <NavbarItem>
            <Button as={Link} color="primary" href="#" variant="flat">
              Sign Up
            </Button>
          </NavbarItem>
        </NavbarContent>
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
          <TimelineCards />
        </div>
      </main>
    </>
  );
}
