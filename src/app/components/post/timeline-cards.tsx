import React, { useState, useEffect, useContext, FC } from "react";
import { Textarea } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { PostCard, PostCardProps } from './card';
import { IClientContext } from '../../contracts/context';

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

    const loadData = async () => {
        const currentData = load ? await load() : await defaultLoad();
        return currentData;
    };

    const defaultLoad = async (): Promise<PostCardProps[]> => {

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
    }, [loading, load]);

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