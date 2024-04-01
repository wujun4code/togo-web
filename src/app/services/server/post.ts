import { proxyGraphQL } from '../../datasources/.server/graphq';
import { GQL } from '../../contracts/graphql';
import { ClientContextValue, LoaderContext, IServerContext, ServerContextValue, IClientContext, IUserContext, getGqlHeaders } from '../../contracts';
import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";


export const getTrendingFeed = async (args: LoaderFunctionArgs, serverContext: IServerContext) => {
    const { trendingFeed } = await proxyGraphQL(args, serverContext.dataSourceConfig.graphql.serverUrl, GQL.GET_TRENDING_FEED, getGqlHeaders(serverContext.user));
    return trendingFeed;
}

export const getTimeline = async (
    args: LoaderFunctionArgs,
    serverContext: IServerContext,
    variables?: any) => {
    const { timeline } = await proxyGraphQL(args, serverContext.dataSourceConfig.graphql.serverUrl, GQL.GET_TIMELINE, variables, getGqlHeaders(serverContext.user));
    return timeline;
}

export const getPost = async (args: LoaderFunctionArgs,
    serverContext: IServerContext,
    variables?: any) => {

    const { post } = await proxyGraphQL(args, serverContext.dataSourceConfig.graphql.serverUrl, GQL.GET_POST, variables, getGqlHeaders(serverContext.user));
    return post;
}

export const getRootComments = async (args: LoaderFunctionArgs,
    serverContext: IServerContext,
    variables?: any) => {

    const { post } = await proxyGraphQL(args, serverContext.dataSourceConfig.graphql.serverUrl, GQL.GET_POST, variables, getGqlHeaders(serverContext.user));
    return post;
}