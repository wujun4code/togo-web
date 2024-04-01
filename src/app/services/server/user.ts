import { ClientContextValue, LoaderContext, IServerContext, ServerContextValue, IClientContext, IUserContext, getGqlHeaders } from '../../contracts';
import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { json, type LinksFunction, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { base64DecodeAccessToken } from '../token';
import { GQL } from '../../contracts/graphql';
import { AuthenticatedUser } from './auth';
import { KeycloakAccessTokenUser } from '../token';
import { sessionStorage } from "./session";
import { proxyGraphQL } from '../../datasources/.server/graphq';

export const getPublicProfile = async (args: LoaderFunctionArgs, serverContext: IServerContext, variables?: any) => {

  const { publicProfile } = await proxyGraphQL(args, serverContext.dataSourceConfig.graphql.serverUrl, GQL.GET_PUBLIC_PROFILE, variables, getGqlHeaders(serverContext.user));
  return publicProfile;
}

export const syncMyProfile = async (args: LoaderFunctionArgs, serverContext: IServerContext, user: AuthenticatedUser | null) => {

  const response = await fetch(`${serverContext.dataSourceConfig.graphql.serverUrl}`, {
    method: 'POST',
    headers: {
      'Authorization': user?.accessToken ? `Bearer ${user?.accessToken}` : "",
      'x-oauth2-token-provider': user?.provider ? `${user?.provider}` : "",
      'x-oauth2-client-id': user?.clientId ? `${user?.clientId}` : "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: GQL.GET_MY_PROFILE,
    }),
  });

  const res = await response.json();
  const { data, errors } = res;
  // console.log(`errors:${JSON.stringify(errors)}`);
  if (errors?.[0]?.extensions?.code) {
    if (errors?.[0]?.extensions?.code === 'Unauthorized') {
      return null;
    }

    throw new Error(`unexpected error message is ${errors?.[0]?.message}`)
  }

  const { snsName, friendlyName, following, follower, openId, avatar, bio } = data.userProfile;

  const userProps = {
    snsName: snsName,
    friendlyName: friendlyName,
    following: following,
    follower: follower,
    openId: openId,
    avatar: avatar,
    bio: bio,
  };

  serverContext.user = {
    accessToken: user?.accessToken,
    togo: userProps,
    oauth2: user?.provider === 'keycloak' ? new KeycloakAccessTokenUser(user.clientId, base64DecodeAccessToken(user?.accessToken)) : user?.oauth2!,
  };
}