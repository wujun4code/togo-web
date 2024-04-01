import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator, keycloakName } from "../services/server/auth";

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await authenticator.authenticate(keycloakName, request, {
        successRedirect: "/",
        failureRedirect: "/login",
    });
};