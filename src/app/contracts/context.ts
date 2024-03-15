import { OAuth2DataSource, GraphQLDataSource, GeoDataSource, GraphQLConfig, OAuth2Config } from '../datasources/index';
import { WeatherService, PostService, OAuthUserService, KeycloakUserService } from '../services/index';
import React, { createContext, useContext, useState } from 'react';

export interface IDataSources {
    oauth2: OAuth2DataSource;
    graphql: GraphQLDataSource;
    geo: GeoDataSource;
}

export interface IServices {
    weather: WeatherService;
    post: PostService;
    oauth2: OAuthUserService;
}

export interface DataSourceConfig {
    graphql: GraphQLConfig;
    oauth2: OAuth2Config;
}

export interface OAuthUserProps {
    sub: string;
    roles: string[];
    resource: string;
}

export interface ToGoUserProps {
    openId: string;
    friendlyName: string;
    snsName: string;
}

export interface IUserContext {
    accessToken: string;
    oauth2: OAuthUserProps;
    togo: ToGoUserProps;
}

export interface IClientContext {
    user?: IUserContext;
    dataSources: IDataSources;
    services: IServices;
    node_env: string;
    togo: ToGoEnvironment;
}

export type ToGoEnvironment = {
    devToken: string;
}

export interface IServerServices {
    oauth2: OAuthUserService;
}

export interface IServerContext {
    dataSourceConfig: DataSourceConfig;
    user?: IUserContext;
    node_env: string;
    togo: ToGoEnvironment;
    services: IServerServices;
}

export class ServerContextValue implements IServerContext {
    dataSourceConfig: DataSourceConfig;
    user?: IUserContext;
    node_env: string;
    togo: ToGoEnvironment;
    services: IServerServices;
    constructor() {
        this.dataSourceConfig = {
            oauth2: { serverUrl: process.env.OAUTH2_SERVER ? process.env.OAUTH2_SERVER : "" },
            graphql: { serverUrl: process.env.GRAPHQL_SERVER ? process.env.GRAPHQL_SERVER : "" },
        };
        this.node_env = process.env.NODE_ENV;
        this.togo = {
            devToken: process.env.devToken ? process.env.devToken : "",
        };
        this.services = {
            oauth2: new KeycloakUserService({ resource: "express-middleware" }),
        };
    }
}

export class ClientContextValue implements IClientContext {
    dataSources: IDataSources;
    services: IServices;
    node_env: string;
    togo: ToGoEnvironment;
    user?: IUserContext;
    constructor(serverContext: ServerContextValue) {
        this.dataSources = {
            oauth2: new OAuth2DataSource(serverContext.dataSourceConfig.oauth2),
            graphql: new GraphQLDataSource(serverContext.dataSourceConfig.graphql),
            geo: new GeoDataSource(),
        };

        this.services = {
            weather: new WeatherService(),
            post: new PostService(),
            oauth2: new KeycloakUserService({ resource: "express-middleware" })
        };

        this.node_env = serverContext.node_env;
        this.togo = serverContext.togo;
        if (this.node_env === 'development') {
            // this.user = {
            //     accessToken: this.togo.devToken,
            // };
        }
    }
}

export interface LoaderContext {
    server: IServerContext;
}
