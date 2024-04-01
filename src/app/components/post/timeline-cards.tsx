import { AnimatePresence, motion } from "framer-motion";
import { FC, useEffect, useState } from "react";
import { IUserContext, Post, PostConnection, Edge } from '../../contracts';
import { useCharactersContext, useTopic } from "../../hooks";
import { PostCard, PostCardProps } from './card';


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
      currentUser: currentUser
    };
  }

  const [posts, setPosts] = useState<PostConnection>(data);
  const [currentUser] = useState(initialCurrentUser);

  const [cards, setCards] = useState(posts ? posts.edges.map(e => mapToCardProps(e.node)) : []);

  const { on, off } = useTopic();
  useEffect(() => {
    const callback = (payload: any) => {
      const newPost = mapToNewPost(payload);
      const newCard = mapToCardProps(newPost);
      setCards(prev => {
        return [newCard, ...prev];
      });

    };
    on('post', 'created', callback);
    return () => {
      off('post', 'created', callback);
    };
  }, [on]);


  return (
    <>
      {!cards ? (
        <p>Loading...</p>
      ) :
        <motion.div layout layoutId={"list"} className="flex flex-col gap-1">
          <AnimatePresence>
            {cards.map((post) => {
              return (
                <motion.div key={post.id}
                  initial={{ x: -250, opacity: 0 }}
                  animate={{ x: 0.2, opacity: 1 }}
                  transition={{ duration: 0.1 }}
                  exit={{ opacity: 0 }}>
                  <PostCard  {...post}></PostCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      }
    </>
  );
}