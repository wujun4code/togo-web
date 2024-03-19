
import type { LoaderFunctionArgs } from "@remix-run/node";

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
    throw new Error(`status: ${response.status},statusText: ${response.statusText}`)
}