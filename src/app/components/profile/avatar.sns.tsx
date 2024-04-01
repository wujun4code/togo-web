import React, { FC, useState, useEffect } from "react";
import { Link } from "@remix-run/react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@components";

import { Button } from "@components";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@components";

import { useMutation, useDataSource, useUserState, AsyncLoaderState, useTopic } from '@hooks';
import { IUserContext, getGqlHeaders, SharedPublicProfile } from '@contracts';
import { GQL } from '@GQL';
import { kFormatter } from '../../services';

type Follow = {
    followee?: SharedPublicProfile,
    follower?: SharedPublicProfile,
    followedAt?: string,
}

export interface FollowRelation {
    asFollower?: Follow,
    asFollowee?: Follow,
}

export interface AvatarSNSProps {
    avatar?: string;
    snsName?: string;
    friendlyName?: string;
}


export interface SharedDetailProps extends AvatarSNSProps {
    avatar?: string;
    snsName?: string;
    friendlyName?: string;
    follower?: any,
    following?: any;
    bio?: any;

    currentUser?: IUserContext;
    followRelation?: FollowRelation;
}

export interface PublicProfileProps {
    snsName?: string;
}

export interface FollowButtonProps {
    currentUser?: IUserContext;
    targetUser: PublicProfileProps;
    followRelation?: FollowRelation;
}

export const FollowRelationButton: FC<FollowButtonProps> = ({ currentUser, targetUser, followRelation }) => {

    //console.log(`followRelation:${JSON.stringify(followRelation)}`);

    if (!followRelation) followRelation = {};
    const { asFollower, asFollowee } = followRelation;

    const [isFollowing, setIsFollowing] = useState<boolean>(asFollower != undefined);
    const [isFollowedBy, setIsFollowedBy] = useState<boolean>(asFollowee != undefined);
    const [isMutualFollowing, setIsMutualFollowing] = useState<boolean>(isFollowing && isFollowedBy);

    const [buttonText, setButtonText] = useState(isMutualFollowing ? 'Mutual Following' : isFollowing ? 'Following' : 'Follow');
    const [buttonDisable, setButtonDisable] = useState(false);

    const { dataSourceConfig } = useDataSource();

    const { pub } = useTopic();
    const { mutateData: followMutation, loading: followingLoading, succeeded: followed, hookState: followingHookState, data: followedData, init: followedInit } = useMutation(dataSourceConfig.graphql.serverUrl, GQL.FOLLOW, 'follow', null, getGqlHeaders(currentUser));
    const { mutateData: unfollowMutation, loading: unfollowingLoading, succeeded: unfollowed, hookState: unfollowingHookState, data: unfollowedData, init: followeeInit } = useMutation(dataSourceConfig.graphql.serverUrl, GQL.UNFOLLOW, 'unfollow', null, getGqlHeaders(currentUser));

    const handleButtonClick = async () => {
        if (isFollowing) {
            unfollowMutation({
                "input": {
                    "snsName": targetUser.snsName,
                }
            });
        }
        else
            followMutation({
                "input": {
                    "snsName": targetUser.snsName,
                }
            });
    };

    useEffect(() => {
        if (followingLoading === true || unfollowingLoading === true) {
            setButtonDisable(true);
        }

        if (!isFollowing && followed) {
            const newFollowing = {
                id: followedData.followerRank,
            };
            pub('following', 'changed', 1);
            setIsFollowing(true);
            setButtonText("Followed");
            setTimeout(() => {
                setButtonText("Following");
                setButtonDisable(false);
            }, 600);
        }

        if (isFollowing && unfollowed) {
            const newUnfollowing = {
                id: followedData.totalFollowing,
            };
            pub('following', 'changed', -1);
            setButtonText("Unfollwed");
            setIsFollowing(false);
            setTimeout(() => {
                setButtonText("Follow");
                setButtonDisable(false);
            }, 600);
        }
    }, [followingHookState, unfollowingHookState]);

    if (currentUser && currentUser.togo.snsName === targetUser.snsName) {
        return (<></>);
    }
    else

        return (<Button disabled={buttonDisable} onClick={handleButtonClick}>{buttonText}</Button>);
}


export const ProfileHeader: FC<SharedDetailProps> = (props: SharedDetailProps) => {

    const { avatar, snsName, friendlyName, follower, following, bio, followRelation, currentUser } = props;

    const [followerCount, setFollowerCount] = useState<number>(follower ? follower.totalCount : 0);
    const { on, off } = useTopic();

    useEffect(() => {
        const callback = (payload: any) => {
            setFollowerCount(prevCount => prevCount + payload);
        };
        on('following', 'changed', callback);
        //on('following', 'deleted', callback);
        return () => {
            off('following', 'changed', callback);
            //off('following', 'deleted', callback);
        };
    }, [on]);

    const followButtonProps = {
        currentUser,
        targetUser: { snsName: snsName },
        followRelation,
    };

    return (
        <div className="flex flex-col gap-4 grow">
            <div className="flex justify-between">
                {avatar ? (<Avatar className="min-w-24 min-h-24">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>{friendlyName?.length || 0 >= 2 ? friendlyName?.substring(0, 2) : friendlyName?.substring(0, 1)}</AvatarFallback>
                </Avatar>) : (<Avatar><AvatarFallback>{friendlyName?.length || 0 >= 2 ? friendlyName?.substring(0, 2) : friendlyName?.substring(0, 1)}</AvatarFallback></Avatar>)}
                <FollowRelationButton {...followButtonProps} />
            </div>
            <div className="flex items-center">
                <div>
                    <p className="text-sm font-medium leading-none">{friendlyName}</p>
                    <p className="text-sm text-muted-foreground">@{snsName}</p>
                </div>
            </div>
            <div className="flex gap-4">
                <p className="font-semibold text-default-400">{bio}</p>
            </div>
            <div className="flex gap-4">
                <div className="flex gap-1 items-baseline">
                    <p className="font-semibold text-default-400">{following ? kFormatter(following.totalCount) : 0}</p>
                    <p className="text-sm text-gray-500">Following</p>
                </div>
                <div className="flex gap-1 items-baseline">
                    <p className="font-semibold text-default-400">{kFormatter(followerCount)}</p>
                    <p className="text-sm text-gray-500">Followers</p>
                </div>
            </div>

        </div>
    );
}

export const PostHeader: FC<SharedDetailProps> = ({ avatar, snsName, friendlyName, follower, following, bio }) => {
    return (
        <div className="flex justify-between grow items-center">
            <div className="flex items-center space-x-4">
                <div className="cursor-pointer hover:bg-gray-100">
                    {avatar ? (<Link to={`/${snsName}`}><Avatar className="min-w-16 min-h-16">
                        <AvatarImage src={avatar} />
                        <AvatarFallback>{friendlyName?.length || 0 >= 2 ? friendlyName?.substring(0, 2) : friendlyName?.substring(0, 1)}</AvatarFallback>
                    </Avatar></Link>) : (<Link to={`/${snsName}`}><Avatar><AvatarFallback>{friendlyName?.length || 0 >= 2 ? friendlyName?.substring(0, 2) : friendlyName?.substring(0, 1)}</AvatarFallback></Avatar></Link>)}
                </div>
                <div>
                    <p className="text-sm font-medium leading-none cursor-pointer hover:underline"><Link to={`/${snsName}`}>{friendlyName}</Link></p>
                    <p className="text-sm text-muted-foreground  cursor-pointer hover:underline"><Link to={`/${snsName}`}>@{snsName}</Link></p>
                </div>
            </div>
            <Button>Follow</Button>
        </div>
    );
}

export const ProfileDetailCard: FC<SharedDetailProps> = ({ avatar, snsName, friendlyName, follower, following, bio }) => {

    return (
        <div className="flex flex-col gap-4 grow">
            <div className="flex justify-between cursor-pointer">
                <div className="flex items-center justify-center hover:bg-gray-100">
                    {avatar ? (<Link to={`/${snsName}`}><Avatar className="w-20 h-20 rounded-full overflow-hidden ">
                        <AvatarImage src={avatar} />
                        <AvatarFallback>{friendlyName?.length || 0 >= 2 ? friendlyName?.substring(0, 2) : friendlyName?.substring(0, 1)}</AvatarFallback>
                    </Avatar></Link>) : (<Link to={`/${snsName}`}><Avatar><AvatarFallback>{friendlyName?.length || 0 >= 2 ? friendlyName?.substring(0, 2) : friendlyName?.substring(0, 1)}</AvatarFallback></Avatar></Link>)}
                </div>
                <Button>Follow</Button>
            </div>
            <div className="flex items-center">
                <div>
                    <p className="text-sm font-medium leading-none cursor-pointer hover:underline"><Link to={`/${snsName}`}>{friendlyName}</Link></p>
                    <p className="text-sm text-muted-foreground  cursor-pointer hover:underline"><Link to={`/${snsName}`}>@{snsName}</Link></p>
                </div>
            </div>
            <div className="flex gap-4">
                <p className="font-semibold text-default-400">{bio}</p>
            </div>
            <div className="flex gap-4">
                <div className="flex gap-1 items-baseline">
                    <p className="font-semibold text-default-400">{following ? kFormatter(following.totalCount) : 0}</p>
                    <p className="text-sm text-gray-500">Following</p>
                </div>
                <div className="flex gap-1 items-baseline">
                    <p className="font-semibold text-default-400">{follower ? kFormatter(follower.totalCount) : 0}</p>
                    <p className="text-sm text-gray-500">Followers</p>
                </div>
            </div>
        </div>
    );
}

export const AvatarSNS: FC<AvatarSNSProps> = (props: AvatarSNSProps) => {
    const { avatar, friendlyName, snsName } = props;
    return (
        <>
            <HoverCard>
                <HoverCardTrigger asChild>
                    <div className="flex items-center space-x-4">
                        {avatar ? (<Link to={`/${snsName}`}><Avatar>
                            <AvatarImage src={avatar} />
                            <AvatarFallback>{friendlyName?.length || 0 >= 2 ? friendlyName?.substring(0, 2) : friendlyName?.substring(0, 1)}</AvatarFallback>
                        </Avatar></Link>) : (<Link to={`/${snsName}`}><Avatar><AvatarFallback>{friendlyName?.length || 0 >= 2 ? friendlyName?.substring(0, 2) : friendlyName?.substring(0, 1)}</AvatarFallback></Avatar></Link>)}
                        <div>
                            <p className="text-sm font-medium leading-none cursor-pointer hover:underline"><Link to={`/${snsName}`}>{friendlyName}</Link></p>
                            <p className="text-sm text-muted-foreground cursor-pointer hover:underline"><Link to={`/${snsName}`}>@{snsName}</Link></p>
                        </div>
                    </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80" side="bottom" align="center">
                    <ProfileDetailCard {...props} />
                </HoverCardContent>
            </HoverCard>
        </>
    )
}