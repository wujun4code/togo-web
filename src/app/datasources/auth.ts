import { IClientContext } from '../contracts/context';
export interface OAuth2Config {
    serverUrl: string;
}

export class OAuth2DataSource {
    serverUrl: string;
    constructor(config: OAuth2Config) {
        this.serverUrl = config.serverUrl;
    }

    async getToken(context: IClientContext, authPath: string) {
        try {
            if (context.node_env === 'development') {
                if (context.togo.devToken) {
                    return {
                        idToken: context.togo.devToken,
                        accessToken: context.togo.devToken
                    };
                }
            }
            const response = await fetch(`${this.serverUrl}/${authPath}`, {
                method: 'GET',
                credentials: 'same-origin',
            });

            if (!response.ok) {
                // Handle 4xx and 5xx errors
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

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
        } catch (error) {
            // Handle network errors or errors from the server
            console.error('Error:', error);
        }
    }
}