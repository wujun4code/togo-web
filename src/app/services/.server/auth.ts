import { Authenticator } from "remix-auth";
import { sessionStorage } from "./session";
import { OAuth2Strategy } from 'remix-auth-oauth2';

type User = {
    accessToken: string;
}

export const authenticator = new Authenticator<User>(sessionStorage);

if (process.env.KEYCLOAK_ENABLE === 'true') {

    console.log('KEYCLOAK_ENABLE');
    if (!process.env.KEYCLOAK_CLIENT_ID) {
        throw new Error("KEYCLOAK_CLIENT_ID is required");
    }

    if (!process.env.KEYCLOAK_CLIENT_SECRET) {
        throw new Error("KEYCLOAK_CLIENT_SECRET is required");
    }

    if (!process.env.KEYCLOAK_HOST) {
        throw new Error("KEYCLOAK_HOST is required");
    }

    if (!process.env.KEYCLOAK_REALM) {
        throw new Error("KEYCLOAK_REALM is required");
    }

    if (!process.env.KEYCLOAK_CALLBACK_URL) {
        throw new Error("KEYCLOAK_CALLBACK_URL is required");
    }

    const callbackUrl = process.env.KEYCLOAK_CALLBACK_URL || "http://localhost:3000/auth/keycloak/callback";

    const clientId = process.env.KEYCLOAK_CLIENT_ID;
    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
    const host = process.env.KEYCLOAK_HOST;
    const realm = process.env.KEYCLOAK_REALM;

    console.log(`realm:${realm}`);

    authenticator.use(
        new OAuth2Strategy(
            {
                authorizationURL: `${host}/realms/ToGo/protocol/openid-connect/auth`,
                tokenURL: `${host}/realms/ToGo/protocol/openid-connect/token`,
                clientID: clientId,
                clientSecret: clientSecret,
                callbackURL: callbackUrl,
                //scope: "openid email profile", // optional
                //useBasicAuthenticationHeader: false // defaults to false
            },
            async ({
                accessToken,
                refreshToken,
                extraParams,
                profile,
                context,
                request,
            }) => {
                // here you can use the params above to get the user and return it
                // what you do inside this and how you find the user is up to you
                // return await getUser(
                //     accessToken,
                //     refreshToken,
                //     extraParams,
                //     profile,
                //     context,
                //     request
                // );
                return {
                    accessToken,
                    refreshToken,
                    extraParams,
                    context,
                    profile,
                };
            }
        ),
        "togo"
    );
}
