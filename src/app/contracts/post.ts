export interface AuthorInfo {
    avatar?: string;
    bio?: string;
    openId: string;
    snsName: string;
    friendlyName: string;
    following: {
        totalCount: number;
    };
    follower: {
        totalCount: number;
    };
    followRelation: {
        followed: boolean;
        followingMe: boolean;
    };
}

export interface PostCommentAggregatedInfo {
    totalCount: number;
}

export interface PostAggregatedInfo {
    comment?: PostCommentAggregatedInfo
}

export interface Post {
    authorInfo: AuthorInfo;
    content: string;
    id: string;
    postedAt: string;

    aggregatedInfo?: PostAggregatedInfo;
}

export interface Comment {
    authorInfo: AuthorInfo;
    content: string;
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface Edge<T> {
    cursor: string;
    node: T;
}

export interface PageInfo {
    endCursor: string;
    hasNextPage: boolean;
}

export interface EdgeConnection<T> {
    totalCount: number;
    edges: Edge<T>[];
    pageInfo: PageInfo;
}

export interface PostConnection extends EdgeConnection<Post> {

}

export interface PostCommentConnection extends EdgeConnection<Comment> {

}