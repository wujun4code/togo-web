import { OAuth2DataSource, GraphQLDataSource, GeoDataSource, GraphQLConfig, OAuth2Config } from '../datasources/index';
import { WeatherService, PostService } from '../services/index';

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

export interface ClientContext {
    dataSources: DataSources;
    services: Services;
    node_env: string;
    towa: TowaEnvironment;
}

export type TowaEnvironment = {
    devToken: string;
}

export interface ServerContext {
    dataSourceConfig: DataSourceConfig;
    node_env: string;
    towa: TowaEnvironment;
}

export class ServerContextValue implements ServerContext {
    dataSourceConfig: DataSourceConfig;
    node_env: string;
    towa: TowaEnvironment;
    constructor() {
        this.dataSourceConfig = {
            oauth2: { serverUrl: process.env.OAUTH2_SERVER ? process.env.OAUTH2_SERVER : "" },
            graphql: { serverUrl: process.env.GRAPHQL_SERVER ? process.env.GRAPHQL_SERVER : "" },
        };
        this.node_env = process.env.NODE_ENV;
        this.towa = {
            devToken: process.env.devToken ? process.env.devToken : "",
        };
    }
}

export class ClientContextValue implements ClientContext {
    dataSources: DataSources;
    services: Services;
    node_env: string;
    towa: TowaEnvironment;
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
        this.towa = serverContext.towa;
    }
}

export interface LoaderContext {
    server: ServerContext;
}