import { OAuth2DataSource, GraphQLDataSource, GeoDataSource, GraphQLConfig, OAuth2Config } from '../datasources/index';
import { WeatherService, PostService } from '../services/index';
import { jwtDecode } from "jwt-decode";

export interface DataSources {
    oauth2: OAuth2DataSource;
    graphql: GraphQLDataSource;
    geo: GeoDataSource;
}

export interface Services {
    weather: WeatherService;
    post: PostService;
}

export interface DataSourceConfig {
    graphql: GraphQLConfig;
    oauth2: OAuth2Config;
}

export interface User {
    accessToken: string;
}

export interface IClientContext {
    user?: User;
    dataSources: DataSources;
    services: Services;
    node_env: string;
    togo: ToGoEnvironment;
    parseJwt(token: string): any;
}

export type ToGoEnvironment = {
    devToken: string;
}

export interface ServerContext {
    dataSourceConfig: DataSourceConfig;
    node_env: string;
    togo: ToGoEnvironment;
}

export class ServerContextValue implements ServerContext {
    dataSourceConfig: DataSourceConfig;
    node_env: string;
    togo: ToGoEnvironment;
    constructor() {
        this.dataSourceConfig = {
            oauth2: { serverUrl: process.env.OAUTH2_SERVER ? process.env.OAUTH2_SERVER : "" },
            graphql: { serverUrl: process.env.GRAPHQL_SERVER ? process.env.GRAPHQL_SERVER : "" },
        };
        this.node_env = process.env.NODE_ENV;
        this.togo = {
            devToken: process.env.devToken ? process.env.devToken : "",
        };
    }
}

export class ClientContextValue implements IClientContext {
    dataSources: DataSources;
    services: Services;
    node_env: string;
    togo: ToGoEnvironment;
    user?: User;
    constructor(serverContext: ServerContextValue) {
        this.dataSources = {
            oauth2: new OAuth2DataSource(serverContext.dataSourceConfig.oauth2),
            graphql: new GraphQLDataSource(serverContext.dataSourceConfig.graphql),
            geo: new GeoDataSource(),
        };

        this.services = {
            weather: new WeatherService(),
            post: new PostService(),
        };

        this.node_env = serverContext.node_env;
        this.togo = serverContext.togo;
        if (this.node_env === 'development') {
            this.user = {
                accessToken: this.togo.devToken,
            };
        }
    }

    parseJwt(token: string) {
        return jwtDecode(token);
    }
}

export interface LoaderContext {
    server: ServerContext;
}
