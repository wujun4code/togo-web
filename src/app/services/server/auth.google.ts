import { authenticator, AuthenticatedUser } from './auth';
import { OAuth2Strategy } from 'remix-auth-oauth2';

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

    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/GOOGLE/callback";

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const host = process.env.GOOGLE_HOST || "https://accounts.google.com/o/oauth2/v2/auth";
    const tokenURL = process.env.GOOGLE_TOKEN_URL || "https://oauth2.googleapis.com/token";

    authenticator.use(
        new OAuth2Strategy(
            {
                authorizationURL: `${host}`,
                tokenURL: `${tokenURL}`,
                clientID: clientId,
                clientSecret: clientSecret,
                callbackURL: callbackUrl,
                scope: "openid email profile", // optional
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
                const data = {
                    accessToken,
                    refreshToken,
                    extraParams,
                    context,
                    profile,
                    provider: "google",
                    clientId: clientId,
                };
                console.log(`GOOGLE:${JSON.stringify(data)}`);
                return data;
            }
        ),
        googleName
    );
}
