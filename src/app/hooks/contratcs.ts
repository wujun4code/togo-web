export enum AsyncLoaderState {
    Init = 'init',
    Loading = 'loading',
    Loaded = 'loaded',
    Failed = 'failed'
}

export enum GraphqlErrorCode {
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
}