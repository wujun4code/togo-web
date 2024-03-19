import { ClientContextValue, LoaderContext, IServerContext, ServerContextValue, IClientContext, IUserContext } from '../../contracts';
import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";

export const getAuth = async (args: LoaderFunctionArgs, serverContext: IServerContext) => {

    const { request } = args;

    const response = await fetch(`${serverContext.dataSourceConfig.oauth2.serverUrl}/oauth2/auth`, {
        headers: {
            'Cookie': `_oauth2_proxy=djIuWDI5aGRYUm9NbDl3Y205NGVTMDJaV0k0T0dKa1pHRmpOemhtWXpJelpqWm1NMkl4WWpKak5qZ3lZalk0TlEuSmpYQU8ydl9abWFWb2tNZWFNQzY4UQ==|1710330819|OAW4-LDUlj4b4l4L2rYVseFs1kX8GM9kkEWNj-UU-Cs=` || request.headers.get('Cookie') || ''
        }
    });

    if (response.ok) {
        const { headers } = response;

        let idToken = headers.get('Authorization');

        if (idToken && idToken.toLowerCase().startsWith('bearer ')) {
            idToken = idToken.slice(7);
        }

        const accessToken = headers.get('X-Auth-Request-Access-Token');
        if (!accessToken) {
            throw new Error(`no access token in response.headers`);
        };

        return { idToken, accessToken };
    }
}

export const parseJwt = (token: string) => {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

export const loadUser = async (args: LoaderFunctionArgs, serverContext: IServerContext) => {

    const auth = await getAuth(args, serverContext);
    if (!auth) return null;

    const oauth2User = parseJwt(auth?.accessToken);

    const GET_MY_PROFILE = `
    query Profile {
        myProfile {
          openId
          snsName
          friendlyName
          following {
            totalCount
          }
          follower {
            totalCount
          }
        }
      }`;

    const response = await fetch(`${serverContext.dataSourceConfig.graphql.serverUrl}`, {
        method: 'POST',
        headers: {
            //'authorization': auth?.idToken ? `Bearer ${auth.idToken}` : "",
            'x-forwarded-access-token': auth?.accessToken ? `${auth.accessToken}` : "",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: GET_MY_PROFILE,
        }),
    });

    const { data } = await response.json();

    if (data?.errors?.[0]?.extensions?.code) {
        if (data?.errors?.[0]?.extensions?.code === 'Unauthorized') {
            return null;
        }

        throw new Error(`unexpected errors.error message is ${data?.errors?.[0]?.message}`)
    }

    const { openId, snsName, friendlyName, following, follower } = data.myProfile;

    const userProps = {
        openId: openId,
        snsName: snsName,
        friendlyName: friendlyName,
        following: following,
        follower: follower,
    };

    serverContext.user = {
        accessToken: auth.accessToken,
        togo: userProps,
        oauth2: oauth2User
    };
}