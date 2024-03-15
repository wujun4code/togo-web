import React, { useState, useEffect, useContext, FC } from "react";
import { Textarea } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { PostCard, PostCardProps } from './card';
import { IClientContext } from '../../contracts/context';
import { useCharactersContext, useUserState, useDataSource, useAsyncLoader, AsyncLoaderState, useGraphQL, useChatRoom } from "../../hooks";

const GET_TIMELINE = `
        query Timeline($input: BaseQueryInput) {
          timeline(input: $input) {
            authorInfo {
              openId
              snsName
              friendlyName
              following {
                totalCount
              }
              follower {
                totalCount
              }
              followRelation {
                followed
                followingMe
              }
            }
            content
            id
            postedAt
          }
        }`;
const GET_TRENDING_FEED = `
        query TrendingFeed {
          trendingFeed {
            authorInfo {
              follower {
                totalCount
              }
              following {
                totalCount
              }
              friendlyName
              openId
              snsName
            }
            content
            id
            postedAt
          }
        }`;
const variables = {
    "input": {
        "filters": {},
        "limit": 10,
        "skip": 0,
        "sorter": {}
    }
};

interface AuthorInfo {
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

interface TimelineProps {
    load?: () => Promise<PostCardProps[]>;
}

export interface TimelineState {
    loading: boolean;
    data: PostCardProps[];
}

export const TimelineCards: FC<TimelineProps> = ({ load }) => {

    //const { currentUser, setCurrentUser } = useUserState();

    const { dataSourceConfig } = useDataSource();

    // const loadTrendingFeed = async (): Promise<PostCardProps[]> => {

    //     const { trendingFeed }: { trendingFeed: Post[] } = await dataSource.graphql.execute(dataSourceConfig.graphql.serverUrl, GET_TRENDING_FEED, null, {
    //         'x-forwarded-access-token': currentUser.accessToken ? `${currentUser.accessToken}` : "",
    //     });

    //     return trendingFeed.map((p) => {
    //         return {
    //             id: p.id,
    //             content: p.content,
    //             postedAt: new Date(p.postedAt),
    //             author: {
    //                 following: {
    //                     totalCount: p.authorInfo.following.totalCount,
    //                 },
    //                 follower: {
    //                     totalCount: p.authorInfo.follower.totalCount,
    //                 },
    //                 followed: false,
    //                 followingMe: false,
    //                 openId: p.authorInfo.openId,
    //                 snsName: p.authorInfo.snsName,
    //                 friendlyName: p.authorInfo.friendlyName,
    //             },
    //         };
    //     });
    // }

    // const loadTimeline = async (): Promise<PostCardProps[]> => {

    //     const { timeline }: { timeline: Post[] } = await dataSource.graphql.execute(dataSourceConfig.graphql.serverUrl, GET_TIMELINE, variables, {
    //         'x-forwarded-access-token': currentUser.accessToken ? `${currentUser.accessToken}` : "",
    //     });

    //     return timeline.map((p) => {
    //         return {
    //             id: p.id,
    //             content: p.content,
    //             postedAt: new Date(p.postedAt),
    //             author: {
    //                 following: {
    //                     totalCount: p.authorInfo.following.totalCount,
    //                 },
    //                 follower: {
    //                     totalCount: p.authorInfo.follower.totalCount,
    //                 },
    //                 followed: p.authorInfo.followRelation.followed,
    //                 followingMe: p.authorInfo.followRelation.followingMe,
    //                 openId: p.authorInfo.openId,
    //                 snsName: p.authorInfo.snsName,
    //                 friendlyName: p.authorInfo.friendlyName,
    //             },
    //         };
    //     });
    // };

    // const loadData = async () => {
    //     if (load) return await load();
    //     if (currentUser && currentUser.togo.openId !== "") {

    //         return await loadTimeline();
    //     }
    //     if (dataSourceConfig.graphql.serverUrl) {

    //         return await loadTrendingFeed();
    //     }

    //     return [];
    // };

    //const { loadingState, data: asyncData } = useAsyncLoader<PostCardProps[]>(loadData);


    // console.log(`cards:dataSourceConfig:${JSON.stringify(dataSourceConfig)}`);
    // if (!dataSourceConfig?.graphql?.serverUrl) {
    //     console.log(`return loading....`);
    //     return <div>Loading...</div>;
    // }

    //const [posts, setPosts] = useState<PostCardProps[]>([]);
    const posts: PostCardProps[] = [];

    const [serverUrl, setServerUrl] = useState('http://localhost:4000');
    const [roomId, setRoomId] = useState('general');

    // if (!dataSourceConfig?.graphql?.serverUrl) {
    //     return <div>Loading...</div>;
    // }

    const { data, hookState } = useGraphQL({
        serverUrl: serverUrl,
        gql: GET_TRENDING_FEED,
        queryName: 'trendingFeed',
        variables: variables,
        headers: { 'x-forwarded-access-token': "accessToken" ? `` : "" }
    });

    if (hookState !== AsyncLoaderState.Loaded) {
        return <div>Loading...</div>;
    }

    if (Object.keys(data).length === 0) {
        return <div>Starting...</div>;
    }


    const trendingFeed = data as Post[];
    const list = trendingFeed.map((p) => {
        return {
            id: p.id,
            content: p.content,
            postedAt: new Date(p.postedAt),
            author: {
                following: {
                    totalCount: p.authorInfo.following.totalCount,
                },
                follower: {
                    totalCount: p.authorInfo.follower.totalCount,
                },
                followed: false,
                followingMe: false,
                openId: p.authorInfo.openId,
                snsName: p.authorInfo.snsName,
                friendlyName: p.authorInfo.friendlyName,
            },
        };
    });

    return (
        <>
            {!list ? (
                <p>Loading...</p>
            ) : list.map((post) => {
                return (<PostCard key={post.id} {...post}></PostCard>);
            })}
        </>
    );
}