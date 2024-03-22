import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { authenticator } from "../services/.server/auth";

export const action = async ({ request }: ActionFunctionArgs) => {
    await authenticator.logout(request, { redirectTo: "/login" });
};