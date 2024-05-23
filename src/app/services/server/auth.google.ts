import { authenticator, AuthenticatedUser } from './auth';
import { OAuth2Strategy } from 'remix-auth-oauth2';
import { GoogleStrategy } from 'remix-auth-google';
import { GQL } from '../../contracts/graphql';

export const googleName = "togo-google";

if (process.env.GOOGLE_ENABLE === 'true') {

    console.log('GOOGLE_ENABLE');
    if (!process.env.GOOGLE_CLIENT_ID) {
        throw new Error("GITHUB_CLIENT_ID is required");
    }

    if (!process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error("GITHUB_CLIENT_SECRET is required");
    }

    if (!process.env.GOOGLE_CALLBACK_URL) {
        throw new Error("GITHUB_CALLBACK_URL is required");
    }

    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback";

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const host = process.env.GOOGLE_HOST || "https://accounts.google.com/o/oauth2/v2/auth";
    const tokenURL = process.env.GOOGLE_TOKEN_URL || "https://oauth2.googleapis.com/token";

    let googleStrategy = new GoogleStrategy(
        {
            clientID: clientId,
            clientSecret: clientSecret,
            callbackURL: callbackUrl,
        },
        async ({ accessToken, refreshToken, extraParams, profile }) => {
            const provider = "google";
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

            const google = {
                accessToken: data.authentication.jwt,
                refreshToken: '',
                extraParams: '',
                context: {},
                profile: profile,
                provider: provider,
                clientId: clientId,
                oauth2: {
                    sub: profile.id,
                    email: profile.emails[0].value,
                    roles: [],
                    resource: clientId,
                    provider: provider,
                    clientId: clientId
                },
            }
            console.log(google);
            return google;
        }
    )

    authenticator.use(googleStrategy, googleName);
}
