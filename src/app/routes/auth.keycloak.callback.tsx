import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "../services/.server/auth";

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await authenticator.authenticate("togo", request, {
        successRedirect: "/profile",
        failureRedirect: "/login",
    });
};