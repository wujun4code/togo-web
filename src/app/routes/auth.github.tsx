import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticator, githubName } from "../services/server/auth";


export const action = async ({ request }: ActionFunctionArgs) => {
    return await authenticator.authenticate(githubName, request, {
        successRedirect: "/",
        failureRedirect: "/login",
    });
};