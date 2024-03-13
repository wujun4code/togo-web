import { IClientContext } from '../contracts/context';

export interface GraphQLConfig {
    serverUrl: string;
}

export class GraphQLDataSource {
    serverUrl: string;
    constructor(config: GraphQLConfig) {
        this.serverUrl = config.serverUrl;
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