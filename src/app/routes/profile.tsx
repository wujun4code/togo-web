import { Button, Image, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ButtonGroup, TimelineCards, Typing, NavProfile } from '../components';
import { ClientContextValue, LoaderContext, ServerContextValue, IClientContext, IUserContext } from '../contracts';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { useUserState, UserProvider, useDataSource, LoadingState } from '../hooks/index';
import { getAuth, loadUser, getTrendingFeed, getTimeline } from '../services/.server';
import { authenticator } from "../services/.server/auth";
import { json } from "@remix-run/node";
import { Form } from '@remix-run/react';

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

interface ProfileContext {
  user: any;
}

export async function loader(args: LoaderFunctionArgs): Promise<any> {
  const { request } = args;

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return json({ user: user });
}


export default function Screen() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex justify-center items-center h-screen">
        <div className="w-96 flex flex-col gap-2 bg-white rounded-lg">
          <div className="flex w-96 justify-between">
            <p className="text-2xl">Profile</p>
            <Form action="/auth/logout" method="post">
              <Button type="submit" color="danger">Log Out</Button>
            </Form></div>
          <div className="flex justify-center items-center ">

            <pre>
              {/* <code>{JSON.stringify(user, null, 2)}</code> */}
            </pre>
          </div>
        </div>
      </div>
    </>
  );
}
