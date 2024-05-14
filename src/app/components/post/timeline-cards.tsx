import { AnimatePresence, motion } from "framer-motion";
import { FC, useEffect, useState } from "react";
import { IUserContext, Post, PostConnection, Edge } from '../../contracts';
import { PostCard, PostCardProps } from './post.list.item.card';
import { useOutletContext } from "@remix-run/react";
import { getGqlHeaders, IClientContext } from "@contracts";
import { useMutation, useDataSource, useUserState, AsyncLoaderState, useTopic, useQuery, useDataQuery, useSubscription } from "@hooks";
import { GQL } from "@GQL";

interface TimelineProps {
  load?: () => Promise<PostCardProps[]>;
  data: PostConnection;
  currentUser?: IUserContext;
  serverUrlX: string;
}

export interface TimelineState {
  loading: boolean;
  data: PostConnection;
}


export const TimelineCards: FC<TimelineProps> = ({ load, serverUrlX, data, currentUser: initialCurrentUser }) => {

  //const { currentUser, setCurrentUser } = useUserState();

  const mapToNewPost = (p: any): Post => {
    return {
      id: p.id,
      content: p.content,
      postedAt: p.postedAt,
      authorInfo: {
        following: {
          totalCount: currentUser?.togo?.following?.totalCount,
        },
        follower: {
          totalCount: currentUser?.togo?.follower?.totalCount,
        },
        followRelation: {
          followingMe: false,
          followed: false,
        },
        openId: currentUser?.togo.openId || "",
        snsName: currentUser?.togo.snsName || "",
        friendlyName: currentUser?.togo.friendlyName || "",
      },
      aggregatedInfo: p.aggregatedInfo
    };
  }


  const mapToCardProps = (post: Post) => {

    const { authorInfo } = post;

    return {
      id: post.id,
      content: post.content,
      postedAt: new Date(post.postedAt),
      author: {
        avatar: authorInfo.avatar,
        bio: authorInfo.bio,
        following: {
          totalCount: authorInfo.following.totalCount,
        },
        follower: {
          totalCount: authorInfo.follower.totalCount,
        },
        followed: authorInfo?.followRelation?.followed ? authorInfo.followRelation.followed : false,
        followingMe: authorInfo?.followRelation?.followingMe ? authorInfo.followRelation.followingMe : false,
        openId: authorInfo.openId,
        snsName: authorInfo.snsName,
        friendlyName: authorInfo.friendlyName,
      },
      aggregatedInfo: post.aggregatedInfo,
      currentUser: currentUser
    };
  }

  const [posts, setPosts] = useState<PostConnection>(data);
  const [currentUser] = useState(initialCurrentUser);

  const [cards, setCards] = useState(posts ? posts.edges.map(e => mapToCardProps(e.node)) : []);
  const { on, off } = useTopic();

  const outletContext = useOutletContext<IClientContext>();

  const handleOnComingCommentData = (data: any) => {
    console.log('handleOnComingCommentData', data);
  }

  if (outletContext.user) {

    // useSubscription(outletContext.dataSources.graphql.subscriptionUrl,
    //   GQL.SUBSCRIPTION_COMMENT_CREATED,
    //   'commentCreated',
    //   null,
    //   handleOnComingCommentData,
    //   getGqlHeaders(outletContext.user));
  }

  useEffect(() => {
    const callback = (payload: any) => {
      const newPost = mapToNewPost(payload);
      const newCard = mapToCardProps(newPost);
      setCards(prev => {
        return [newCard, ...prev];
      });
    };
    on('post', 'created', 'new-post', callback);
    return () => {
      off('post', 'created', 'new-post', callback);
    };
  }, [on]);


  return (
    <>
      {!cards ? (
        <p>Loading...</p>
      ) :
        <div>
          {cards.map((post) => {
            return (
              <div key={post.id} className="">
                <PostCard  {...post}></PostCard>
              </div>
            );
          })}
        </div>
      }
    </>
  );
}