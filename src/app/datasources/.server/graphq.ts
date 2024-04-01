
import type { LoaderFunctionArgs } from "@remix-run/node";
import { IServerContext, getGqlHeaders } from '@contracts';

export const executeGraphQL = async (args: LoaderFunctionArgs, serverContext: IServerContext, gql: string, variables?: any) => {
    return await proxyGraphQL(args, serverContext.dataSourceConfig.graphql.serverUrl, gql, variables, getGqlHeaders(serverContext.user));
}

export const proxyGraphQL = async (
    args: LoaderFunctionArgs,
    serverUrl: string,
    gql: string,
    variables?: any,
    headers?: any) => {

    const { request } = args;

    const gqlHeaders = headers ? {
        ...headers,
        "Content-Type": "application/json",
    } : { "Content-Type": "application/json", }


    const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
            ...gqlHeaders,
            'Cookie': request.headers.get('Cookie') || '',
            'Authorization': gqlHeaders['Authorization'] ? gqlHeaders['Authorization'] : request.headers.get('Authorization') || '',
            'x-forwarded-access-token': gqlHeaders['x-forwarded-access-token'] ? gqlHeaders['x-forwarded-access-token'] : request.headers.get('x-forwarded-access-token') || '',
        },
        body: JSON.stringify({
            query: gql,
            variables: variables ? variables : undefined,
        }),
    });

    if (response.ok) {
        const { data } = await response.json();
        if (data?.errors?.[0]?.extensions?.code) {
            if (data?.errors?.[0]?.extensions?.code === 'Unauthorized') {
                return null;
            }
            throw new Error(`unexpected errors.error message is ${data?.errors?.[0]?.message}`)
        }
        return data;
    }

    console.log(`gql:${gql}`);
    throw new Error(`status: ${response.status},statusText: ${response.statusText}`)
}