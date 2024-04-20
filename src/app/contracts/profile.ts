import { Edge, PageInfo, EdgeConnection } from '@contracts';
export interface SharedPublicProfile {
    snsName: string,
    friendlyName: string,
    avatar: string,
    bio: string,
}

export type AvatarProfile = {
    following:
    {
        totalCount: number,
    };
    follower:
    {
        totalCount: number,
    };
    followed: boolean;
    followingMe: boolean;
    openId: string;
    friendlyName: string;
    snsName: string;
    avatar?: string;
    bio?: string;
}
