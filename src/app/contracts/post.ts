export interface AuthorInfo {
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
export interface Post {
    authorInfo: AuthorInfo;
    content: string;
    id: string;
    postedAt: string; // Consider using a Date type if needed
}