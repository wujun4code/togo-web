import React, { useState, useEffect, useContext, FC } from "react";
import { Textarea } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { PostCard, PostCardProps } from './card';
import { IClientContext } from '../../contracts/context';
import { useCharactersContext, useUserState } from "../../hooks/user";
interface TimelineProps {
    clientContext: IClientContext;
    load?: () => Promise<PostCardProps[]>;
}

export interface TimelineState {
    loading: boolean;
    data: PostCardProps[];
}

export const TimelineCards: FC<TimelineProps> = ({ load, clientContext }) => {

    const [data, setData] = useState<PostCardProps[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { currentUserX, setCurrentUserX } = useUserState();

    const loadData = async () => {
        console.log(`currentUserX:${JSON.stringify(currentUserX)}`);
        if (load) return await load();
        if (currentUserX && currentUserX.togo.openId !== "") return await loadTimeline();
        return await loadTrendingFeed();
    };

    const loadTrendingFeed = async (): Promise<PostCardProps[]> => {

        const source = await clientContext.services.post.getTrendingFeed(clientContext);

        return source.map((p) => {
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
                clientContext: clientContext
            };
        });
    }

    const loadTimeline = async (): Promise<PostCardProps[]> => {

        const source = await clientContext.services.post.getTimeline(clientContext);

        return source.map((p) => {
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
                    followed: p.authorInfo.followRelation.followed,
                    followingMe: p.authorInfo.followRelation.followingMe,
                    openId: p.authorInfo.openId,
                    snsName: p.authorInfo.snsName,
                    friendlyName: p.authorInfo.friendlyName,
                },
                clientContext: clientContext
            };
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await loadData();
                setData(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (loading) {
            fetchData();
        }
    }, [loading, load, currentUserX]);

    return (
        <>
            {loading ? (
                <p>Loading...</p>
            ) : data.map((post) => {
                return (<PostCard key={post.id} {...post}></PostCard>);
            })}
        </>
    );
}