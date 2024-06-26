import { IClientContext } from '../contracts/context';

export const execute = async (serverUrl: string, gql: string, variables?: any, headers?: any) => {
    try {
        const response = await fetch(serverUrl, {
            method: 'POST',
            credentials: 'same-origin',
            headers: headers ? {
                ...headers,
                "Content-Type": "application/json",
            } : { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: gql,
                variables: variables ? variables : undefined,
            }),
        });

        const { data } = await response.json();
        return data;
    }
    catch (error) {
        console.error(error);
        return {};
    }
}

export interface GraphQLConfig {
    serverUrl: string;
    subscriptionUrl: string;
}

export class GraphQLDataSource {
    serverUrl: string;
    subscriptionUrl: string;
    constructor(config: GraphQLConfig) {
        this.serverUrl = config.serverUrl;
        this.subscriptionUrl = config.subscriptionUrl;
    }

    async execute(serverUrl: string, gql: string, variables?: any, headers?: any) {
        const response = await fetch(serverUrl, {
            method: 'POST',
            credentials: 'same-origin',
            headers: headers ? {
                ...headers,
                "Content-Type": "application/json",
            } : { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: gql,
                variables: variables ? variables : undefined,
            }),
        });
        const { data } = await response.json();
        return data;
    }

    async query(context: IClientContext, query: string, variables?: any) {
        let accessToken = '';
        let idToken = '';
        if (context.node_env === 'development') {
            if (context.togo.devToken) {
                idToken = context.togo.devToken;
                accessToken = context.togo.devToken;
            }
            else {
                const auth = await context.dataSources.oauth2.getToken(context, 'oauth2/auth');
                if (auth != undefined && auth.accessToken != null) {
                    accessToken = auth.accessToken;
                }
                if (auth != undefined && auth.idToken != null) {
                    idToken = auth.idToken;
                }
            }

            const response = await fetch(this.serverUrl, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'authorization': idToken ? `Bearer ${idToken}` : "",
                    'x-forwarded-access-token': accessToken ? `${accessToken}` : "",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query,
                    variables: variables ? variables : undefined,
                }),
            });
            const { data } = await response.json();
            return data;
        } else {
            const response = await fetch(this.serverUrl, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query,
                    variables: variables ? variables : undefined,
                }),
            });

            const { data } = await response.json();

            return data;
        }
    }
}