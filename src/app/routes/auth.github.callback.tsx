import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator, githubName } from "../services/server/auth";

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await authenticator.authenticate(githubName, request, {
        successRedirect: "/",
        failureRedirect: "/login",
    });
};