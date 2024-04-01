import { OAuthUserProps } from '@contracts';

export const base64DecodeAccessToken = (token: string) => {
    if (typeof window === 'undefined') {
        const [, base64Payload] = token.split('.');
        return JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf-8'));
    } else {
        const [, base64Payload] = token.split('.');
        return JSON.parse(atob(base64Payload));
    }
}

export interface OAuth2UserInterface extends OAuthUserProps {

    sub: string;
    username: string;
    roles: string[];
    permissions: string[];
    email: string;
    friendlyName: string;
}

export interface KeycloakAccessTokenContent {
    sub: string;
    realm_access: {
        roles: string[];
    };
    resource_access: {
        [key: string]: {
            roles: string[];
        };
    };
    name: string;
    preferred_username: string;
    given_name: string;
    family_name: string;
    email: string;
}


export class KeycloakAccessTokenUser implements OAuth2UserInterface {

    content: KeycloakAccessTokenContent;
    provider: string;
    clientId: string;
    resource: string;
    sub: string;
    email: string;
    username: string;
    friendlyName: string;
    roles: string[];
    permissions: string[];

    constructor(resource: string, accessTokenContent: KeycloakAccessTokenContent) {

        this.content = accessTokenContent;
        this.sub = this.content.sub;
        this.email = this.content.email;
        this.username = this.content.preferred_username;
        this.friendlyName = this.content.name;
        this.provider = 'keycloak';
        this.clientId = resource;
        this.resource = resource;
        this.roles = this.content.resource_access[resource]['roles'];
        this.email = this.content.email;
        this.permissions = this.content.resource_access[resource]['roles'];
    }


    hasRole = (roleName: string): boolean => {
        return this.roles.includes(roleName);
    }

    hasPermission = (permission: string): boolean => {
        return this.hasRole(permission);
    }
}