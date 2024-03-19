import { IClientContext, OAuthUserProps, ToGoUserProps, IUserContext } from '../contracts/context';


export interface OAuthUserService {
    decode(accessToken: string): OAuthUserProps;
    fetchToGoUser(context: IClientContext): Promise<ToGoUserProps | null>;
    logIn(context: IClientContext): Promise<IUserContext | undefined>;
}

export class KeycloakUserService implements OAuthUserService {

    resource: string;
    constructor(config: { resource: string }) {
        this.resource = config.resource;
    }
    parseJwt(token: string) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }
    decode(accessToken: string): OAuthUserProps {

        const content = this.parseJwt(accessToken);
        if (!content) throw new Error('invalid keycloak token.');
        if (typeof content === 'string') throw new Error('invalid keycloak token.');
        if (!content.sub) throw new Error('invalid keycloak token.');

        const userProps = {
            sub: content.sub,
            roles: content['resource_access'][this.resource]['roles'],
            resource: this.resource,
        };

        return userProps;
    }

    async logIn(context: IClientContext) {
        const oauth2Token = await context.dataSources.oauth2.getToken(context, 'oauth2/auth');

        if (oauth2Token && oauth2Token.accessToken) {

            const oauth2User = context.services.oauth2.decode(oauth2Token.accessToken);
            const toGoUser = await context.services.oauth2.fetchToGoUser(context);
            if (toGoUser) {

                const user = {
                    accessToken: oauth2Token.accessToken,
                    oauth2: oauth2User,
                    togo: toGoUser
                };

                return user;
            }
        }
    }

    async fetchToGoUser(context: IClientContext): Promise<ToGoUserProps | null> {

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

        const data = await context.dataSources.graphql.query(context, GET_MY_PROFILE);

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
        return userProps;
    }
}
