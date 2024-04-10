import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "../services/server/auth";
import { googleName } from "../services/server/auth.google";

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await authenticator.authenticate(googleName, request, {
        successRedirect: "/",
        failureRedirect: "/login",
    });
};