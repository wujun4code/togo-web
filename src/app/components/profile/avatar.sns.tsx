import React, { FC, useState, useEffect, ReactNode } from "react";
import { Link, useNavigate } from "@remix-run/react";

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

import { useMutation, useDataSource, useUserState, AsyncLoaderState, useTopic, useQuery } from '@hooks';
import { IUserContext, getGqlHeaders, SharedPublicProfile } from '@contracts';
import { MentionLink, Mention } from '@components';
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
    openId?: string;
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

    if (!followRelation) followRelation = { asFollower: undefined, asFollowee: undefined };

    const { asFollower, asFollowee } = followRelation;

    const [isFollowing, setIsFollowing] = useState<boolean>(asFollower != undefined && asFollower != null);

    const [isFollowedBy, setIsFollowedBy] = useState<boolean>(asFollowee != undefined);
    const [isMutualFollowing, setIsMutualFollowing] = useState<boolean>(isFollowing && isFollowedBy);

    const [buttonText, setButtonText] = useState(isMutualFollowing ? 'Mutual Following' : isFollowing ? 'Following' : 'Follow');
    const [buttonDisable, setButtonDisable] = useState(false);

    const { dataSourceConfig } = useDataSource();

    const { pub } = useTopic();
    const { mutateData: followMutation, loading: followingLoading, succeeded: followed, hookState: followingHookState, data: followedData, error: followError } = useMutation(dataSourceConfig.graphql.serverUrl, GQL.FOLLOW, getGqlHeaders(currentUser));
    const { mutateData: unfollowMutation, loading: unfollowingLoading, succeeded: unfollowed, hookState: unfollowingHookState, data: unfollowedData } = useMutation(dataSourceConfig.graphql.serverUrl, GQL.UNFOLLOW, getGqlHeaders(currentUser));

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

        if (followError) {
            if (followError === 401) {
                pub('require', 'login', true);
            }
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
            pub('following', 'changed', -1);
            setButtonText("Unfollwed");
            setIsFollowing(false);
            setTimeout(() => {
                setButtonText("Follow");
                setButtonDisable(false);
            }, 600);
        }
    }, [followingHookState, unfollowingHookState, followRelation]);

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
        on('following', 'changed', 'ProfileHeader', callback);
        //on('following', 'deleted', callback);
        return () => {
            off('following', 'changed', 'ProfileHeader', callback);
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

export const PostHeader: FC<SharedDetailProps> = (props: SharedDetailProps) => {

    const { avatar, snsName, friendlyName, follower, following, bio, followRelation, currentUser } = props;

    const followButtonProps = {
        currentUser,
        targetUser: { snsName: snsName },
        followRelation,
    };

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
            <FollowRelationButton {...followButtonProps} />
        </div>
    );
}

export const ProfileDetailCard: FC<SharedDetailProps> = (props: SharedDetailProps) => {

    const { avatar, snsName, friendlyName, follower, following, bio, followRelation, currentUser } = props;

    const followButtonProps = {
        currentUser,
        targetUser: { snsName: snsName },
        followRelation,
    };

    return (
        <div className="flex flex-col gap-4 grow">
            <div className="flex justify-between cursor-pointer">
                <div className="flex items-center justify-center hover:bg-gray-100">
                    {avatar ? (<Link to={`/${snsName}`}><Avatar className="w-20 h-20 rounded-full overflow-hidden ">
                        <AvatarImage src={avatar} />
                        <AvatarFallback>{friendlyName?.length || 0 >= 2 ? friendlyName?.substring(0, 2) : friendlyName?.substring(0, 1)}</AvatarFallback>
                    </Avatar></Link>) : (<Link to={`/${snsName}`}><Avatar><AvatarFallback>{friendlyName?.length || 0 >= 2 ? friendlyName?.substring(0, 2) : friendlyName?.substring(0, 1)}</AvatarFallback></Avatar></Link>)}
                </div>
                <FollowRelationButton {...followButtonProps} />
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

type HoverCardProfileDetailCardProps = {
    children: ReactNode;
    props: SharedDetailProps;
}

export const HoverCardProfileDetailCard: FC<HoverCardProfileDetailCardProps> = ({ props, children }) => {

    const { snsName, currentUser, followRelation } = props;
    const [detailState, setDetailState] = React.useState(props);
    const [open, setOpen] = React.useState(false);
    const [followRelationState, setFollowRelationState] = React.useState(followRelation);

    const { dataSourceConfig } = useDataSource();

    const { query: followRelationQuery, loading: followRelationLoading, succeeded: followRelationSucceeded, hookState: followRelationHookState, data: followRelationData } =
        useQuery(dataSourceConfig.graphql.serverUrl, GQL.FOLLOW_RELATION, getGqlHeaders(currentUser));

    const { query: profileQuery, loading: profileLoading, succeeded: profileSucceeded, hookState: profileHookState, data: profileData } =
        useQuery(dataSourceConfig.graphql.serverUrl, GQL.GET_PUBLIC_SNS_PROFILE, getGqlHeaders(currentUser));

    const onProfileDetailCardOpen = async (open: boolean) => {
        if (open) {
            if (currentUser) {
                const data = await followRelationQuery({
                    "followRelationInput": {
                        "originalSnsName": currentUser?.togo.snsName,
                        "targetSnsName": snsName,
                    },
                    "publicProfileInput": { "snsName": snsName }
                });
                if (data?.followRelation)
                    setFollowRelationState(data.followRelation);
                if (data?.publicProfile)
                    setDetailState(data.publicProfile);
            }
            else {
                const { publicProfile: targetProfileData } = await profileQuery({
                    "input": { "snsName": snsName }
                });
                setDetailState(targetProfileData);
            }
            setOpen(open);
        } else {
            setOpen(open);
        }
    };
    return (<HoverCard open={open} onOpenChange={onProfileDetailCardOpen}>
        <HoverCardTrigger asChild>
            {children}
        </HoverCardTrigger>
        <HoverCardContent className="w-80" side="bottom" align="center">
            <ProfileDetailCard {...detailState} followRelation={followRelationState} currentUser={currentUser} />
        </HoverCardContent>
    </HoverCard>);
}

export interface MentionLinkHoverProfileProps {
    mention: Mention;
    currentUser?: IUserContext;
}

export const MentionLinkHoverProfile: FC<MentionLinkHoverProfileProps> = (props: MentionLinkHoverProfileProps) => {

    const { id, type, displayName } = props.mention;
    const { currentUser } = props;
    const snsName = type === 'usns' ? id : undefined;
    const navigate = useNavigate();

    const handleMentionLinkClick = (e: React.MouseEvent<HTMLSpanElement>) => {
        //navigate(`/post/${id}`);
        e.stopPropagation();
        e.preventDefault();
        navigate(`/${snsName}`);
    }
    return (<HoverCardProfileDetailCard props={{ snsName: snsName, currentUser: currentUser }}>
        {/* <MentionLink mention={props.mention} /> */}
        {/* <Link className='text-blue-600' to={`/${snsName}`}>@{displayName}</Link> */}
        <span className="cursor:pointer text-blue-600" onClick={e => handleMentionLinkClick(e)}>@{displayName}</span>
        {/* <Link className='text-blue-600' to={`/${snsName}`}>@{displayName}</Link> */}
    </HoverCardProfileDetailCard >)
}

export const AvatarSNS: FC<SharedDetailProps> = (props: SharedDetailProps) => {
    const { avatar, friendlyName, snsName } = props;

    return (
        <>
            <HoverCardProfileDetailCard props={props}>
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
            </HoverCardProfileDetailCard>
        </>
    );
}


