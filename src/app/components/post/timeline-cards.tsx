import React, { useState, useEffect, FC } from "react";
import { Textarea } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { PostCard, PostCardProps } from './card';


interface TimelineProps {
    load?: () => Promise<PostCardProps[]>;
}

export interface TimelineState {
    loading: boolean;
    data: PostCardProps[];
}

export const TimelineCards: FC<TimelineProps> = ({ load }) => {

    const [state, setState] = useState<TimelineState>({
        loading: true,
        data: []
    });

    const fetchData = async () => {
        if (state.loading) return;
        if (!load) return;
        state.loading = true;
        try {
            const fetchedData = await load();
            setState((prev) => {
                return { ...prev, data: fetchedData, loading: false };
            });
        }
        catch (error) {
            setState((prev) => {
                return { ...prev, loading: false };
            });
        }
    };

    useEffect(() => {

        fetchData();
        
    }, [load]);


    const samplePosts: PostCardProps[] = [
        {
            content: "balabalabala",
            postedAt: new Date(),
            author: {
                following:
                {
                    totalCount: 90,
                },
                follower:
                {
                    totalCount: 2933993,
                },
                followed: false,
                followingMe: false,
                openId: "223",
                friendlyName: "Jun Wu",
                snsName: "wujun4code"
            }
        }
    ];

    return (
        <>
            {samplePosts.map((post) => {
                return (
                    <PostCard {...post}>
                    </PostCard>);
            })}
        </>
    );
}