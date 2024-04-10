import { Authenticator } from "remix-auth";
import { sessionStorage } from "./session";
import { OAuth2Strategy } from 'remix-auth-oauth2';
import { GitHubStrategy } from "remix-auth-github";
import { OAuthUserProps } from '../../contracts';
import { GQL } from '../../contracts/graphql';

export type AuthenticatedUser = {
    accessToken: any;
    refreshToken: any;
    extraParams: any;
    context: any;
    profile: any;
    provider: string;
    clientId: string;
    oauth2?: OAuthUserProps;
}

export const keycloakName = '"togo-keycloak';

export const authenticator = new Authenticator<AuthenticatedUser>(sessionStorage);

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

    authenticator.use(
        new OAuth2Strategy(
            {
                authorizationURL: `${host}/realms/${realm}/protocol/openid-connect/auth`,
                tokenURL: `${host}/realms/${realm}/protocol/openid-connect/token`,
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
                    provider: "keycloak",
                    clientId: clientId,
                };
            }
        ),
        keycloakName
    );
}

export const githubName = "togo-github";

if (process.env.GITHUB_ENABLE === 'true') {

    console.log('GITHUB_ENABLE');
    if (!process.env.GITHUB_CLIENT_ID) {
        throw new Error("GITHUB_CLIENT_ID is required");
    }

    if (!process.env.GITHUB_CLIENT_SECRET) {
        throw new Error("GITHUB_CLIENT_SECRET is required");
    }

    if (!process.env.GITHUB_CALLBACK_URL) {
        throw new Error("GITHUB_CALLBACK_URL is required");
    }

    const callbackUrl = process.env.GITHUB_CALLBACK_URL || "http://localhost:3000/auth/github/callback";

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    let gitHubStrategy = new GitHubStrategy(
        {
            clientID: clientId,
            clientSecret: clientSecret,
            callbackURL: callbackUrl,
        },
        async ({ accessToken, extraParams, profile }) => {
            const provider = "github";
            const variables = {
                input: {
                    accessToken: accessToken,
                    provider: provider,
                    clientId: clientId
                }
            };

            const response = await fetch(`${process.env.GRAPHQL_SERVER}`, {
                method: 'POST',
                headers: {
                    'Authorization': `${accessToken}`,
                    'x-oauth2-token-provider': provider,
                    'x-oauth2-client-id': clientId,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: GQL.AUTHENTICATION,
                    variables: variables
                }),
            });

            const res = await response.json();
            const { data, errors } = res;

            const github = {
                accessToken: data.authentication.jwt,
                refreshToken: '',
                extraParams: '',
                context: {},
                profile: profile,
                provider: "github",
                clientId: clientId,
                oauth2: {
                    sub: profile.id,
                    email: profile.emails[0].value,
                    roles: [],
                    resource: clientId,
                    provider: "github",
                    clientId: clientId
                },
            }
            console.log(github);
            return github;

        }
    );

    authenticator.use(gitHubStrategy, githubName);
}
