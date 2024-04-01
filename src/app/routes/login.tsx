import { Button} from "@components/index";
import type { LinksFunction, LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { Form } from '@remix-run/react';
import { authenticator } from "../services/server/auth";

export const links: LinksFunction = () => [
    {
        rel: "preload",
        href: "/logo-blue.svg",
        as: "image",
        type: "image/svg+xml",
    }
];

export async function loader(args: LoaderFunctionArgs): Promise<any> {
    const { request } = args;
    return {};
}

export default function Screen() {
    return (
        <>
            <div className="flex justify-center items-center h-screen bg-blue-950">
                <div className="w-96 h-96 flex flex-col justify-center items-center gap-2 bg-white rounded-lg">
                    <img
                        className="size-24"
                        alt="Towa Logo"
                        src="/logo-blue.svg"
                    />
                    <p className="text-2xl"> Welcome </p>
                    <p> Log in to ToGo to continue.</p>
                    <Form action="/auth/google" method="post">
                        <Button className="w-44" type="submit">Login with Google</Button>
                    </Form>
                    <Form action="/auth/github" method="post">
                        <Button className="w-44" type="submit">Login with GitHub</Button>
                    </Form>
                    <Form action="/auth/keycloak" method="post">
                        <Button className="w-44" type="submit">Login with Keycloak</Button>
                    </Form>
                </div>
            </div>
        </>
    );
}