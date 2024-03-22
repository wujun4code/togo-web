import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticator } from "../services/.server/auth";


export const action = async ({ request }: ActionFunctionArgs) => {
    return await authenticator.authenticate("togo", request, {
        successRedirect: "/profile",
        failureRedirect: "/login",
    });
};