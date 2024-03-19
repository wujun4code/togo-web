import { FC, useState, useEffect } from "react";
import { IUserContext, Post } from '../../contracts';
import { useCharactersContext, useDataSource, useTopic } from "../../hooks";
import { PostCard, PostCardProps } from './card';
import { motion, AnimatePresence } from "framer-motion"

interface TimelineProps {
  load?: () => Promise<PostCardProps[]>;
  data?: any;
  currentUser?: IUserContext;
  serverUrlX: string;
}

export interface TimelineState {
  loading: boolean;
  data: PostCardProps[];
}

export const TimelineCards: FC<TimelineProps> = ({ load, serverUrlX, data, currentUser: initialCurrentUser }) => {

  //const { currentUser, setCurrentUser } = useUserState();
  const {
    characterId,
    setCharacterId
  } = useCharactersContext();

  const { dataSourceConfig } = useDataSource();

  // const loadTrendingFeed = async (): Promise<PostCardProps[]> => {

  //   const { trendingFeed }: { trendingFeed: Post[] } = await dataSource.graphql.execute(dataSourceConfig.graphql.serverUrl, GET_TRENDING_FEED, null, {
  //     'x-forwarded-access-token': currentUser.accessToken ? `${currentUser.accessToken}` : "",
  //   });

  //   return trendingFeed.map((p) => {
  //     return {
  //       id: p.id,
  //       content: p.content,
  //       postedAt: new Date(p.postedAt),
  //       author: {
  //         following: {
  //           totalCount: p.authorInfo.following.totalCount,
  //         },
  //         follower: {
  //           totalCount: p.authorInfo.follower.totalCount,
  //         },
  //         followed: false,
  //         followingMe: false,
  //         openId: p.authorInfo.openId,
  //         snsName: p.authorInfo.snsName,
  //         friendlyName: p.authorInfo.friendlyName,
  //       },
  //     };
  //   });
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



  const [serverUrl, setServerUrl] = useState('');
  const [roomId, setRoomId] = useState('general');

  // if (!dataSourceConfig?.graphql?.serverUrl) {
  //     return <div>Loading...</div>;
  // }

  // useEffect(() => {
  //   // 在 useEffect 中监听 dataSourceConfig.graphql.serverUrl 的变化
  //   // 并执行相应的逻辑来触发组件的刷新
  //   // 这里可以根据 dataSourceConfig.graphql.serverUrl 的变化执行相应的逻辑
  //   // 比如调用其他 hook 或设置组件的状态来触发刷新

  //   console.log(`watch serverUrl changed:${dataSourceConfig.graphql.serverUrl}`);
  //   setServerUrl(dataSourceConfig.graphql.serverUrl);
  // }, [dataSourceConfig.graphql.serverUrl]);

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


  const mapToCardProps = (p: any) => {
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
        followed: p.authorInfo?.followRelation?.followed ? p.authorInfo.followRelation.followed : false,
        followingMe: p.authorInfo?.followRelation?.followingMe ? p.authorInfo.followRelation.followingMe : false,
        openId: p.authorInfo.openId,
        snsName: p.authorInfo.snsName,
        friendlyName: p.authorInfo.friendlyName,
      },
      currentUser: currentUser
    };
  }

  const [posts, setPosts] = useState<Post[]>(data);
  const [currentUser] = useState(initialCurrentUser);
  const [cards, setCards] = useState(posts ? posts.map(mapToCardProps) : []);

  const { on, off } = useTopic();
  useEffect(() => {
    const callback = (payload: any) => {
      const newPost = mapToNewPost(payload);
      console.log(`newPost:${JSON.stringify(newPost)}`);

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


  // const { data: clientData, hookState } = useGraphQL({
  //   serverUrl: serverUrlX,
  //   gql: GET_TRENDING_FEED,
  //   queryName: 'trendingFeed',
  //   variables: variables,
  //   headers: { 'x-forwarded-access-token': "accessToken" ? `` : "" }
  // });

  // if (hookState !== AsyncLoaderState.Loaded) {
  //   return <div>Loading...</div>;
  // }

  // if (Object.keys(clientData).length === 0) {
  //   return <div>Starting...</div>;
  // }



  // const trendingFeed = clientData as Post[];
  // const list = trendingFeed.map((p) => {
  //   return {
  //     id: p.id,
  //     content: p.content,
  //     postedAt: new Date(p.postedAt),
  //     author: {
  //       following: {
  //         totalCount: p.authorInfo.following.totalCount,
  //       },
  //       follower: {
  //         totalCount: p.authorInfo.follower.totalCount,
  //       },
  //       followed: false,
  //       followingMe: false,
  //       openId: p.authorInfo.openId,
  //       snsName: p.authorInfo.snsName,
  //       friendlyName: p.authorInfo.friendlyName,
  //     },
  //   };
  // });

  return (
    <>
      {!cards ? (
        <p>Loading...</p>
      ) : cards.map((post) => {
        return (
          <div key={post.id}>
            <PostCard  {...post}></PostCard>
          </div>
        );
      })}
    </>
  );
}