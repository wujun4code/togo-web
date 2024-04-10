import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticator } from "../services/server/auth";
import { googleName } from "../services/server/auth.google";


export const action = async ({ request }: ActionFunctionArgs) => {
    return await authenticator.authenticate(googleName, request, {
        successRedirect: "/",
        failureRedirect: "/login",
    });
};