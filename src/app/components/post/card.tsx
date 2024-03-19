import { Avatar, Button, Card, CardBody, CardFooter, CardHeader, Skeleton } from "@nextui-org/react";
import React, { FC, useState } from "react";
import { IUserContext } from '../../contracts/context';
import { LoadingState, useUserState } from "../../hooks";


export const TestSkeleton = () => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  const toggleLoad = () => {
    setIsLoaded(!isLoaded);
  };

  return (
    <div className="flex flex-col gap-3">
      <Card className="w-[200px] space-y-5 p-4" radius="lg">
        <Skeleton isLoaded={isLoaded} className="rounded-lg">
          <div className="h-24 rounded-lg bg-secondary"></div>
        </Skeleton>
        <div className="space-y-3">
          <Skeleton isLoaded={isLoaded} className="w-3/5 rounded-lg">
            <div className="h-3 w-full rounded-lg bg-secondary"></div>
          </Skeleton>
          <Skeleton isLoaded={isLoaded} className="w-4/5 rounded-lg">
            <div className="h-3 w-full rounded-lg bg-secondary-300"></div>
          </Skeleton>
          <Skeleton isLoaded={isLoaded} className="w-2/5 rounded-lg">
            <div className="h-3 w-full rounded-lg bg-secondary-200"></div>
          </Skeleton>
        </div>
      </Card>
      <Button size="sm" variant="flat" color="secondary" onPress={toggleLoad}>
        {isLoaded ? "Show" : "Hide"} Skeleton
      </Button>
    </div>
  );
}

export type Author = {
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
}

export interface PostCardProps {
  content: string;
  postedAt: Date;
  author: Author;
  id: string;
  currentUser?: IUserContext
}

export const PostCard: FC<PostCardProps> = ({ author, content, postedAt, currentUser: initialCurrentUser }) => {

  const [isFollowed, setIsFollowed] = React.useState(author.followed ? author.followed : false);
  const [user, setUser] = useState(initialCurrentUser);
  const { currentUser, setCurrentUser, loadingState, setLoadingState } = useUserState();
  const currentUserOpenId = user?.togo?.openId;

  const [isHideFollow, setIsHideFollow] = React.useState(currentUserOpenId === author.openId);

  function kFormatter(num: number): string {
    return Math.abs(num) > 999
      ? `${Math.sign(num) * parseInt((Math.abs(num) / 1000).toFixed(1))}k`
      : `${Math.sign(num) * Math.abs(num)}`;
  }

  //return (<TestSkeleton />)

  return (
    <Card className="">
      <CardHeader className="justify-between">
        <div className="flex gap-5">
          <Skeleton isLoaded={loadingState === LoadingState.Loaded} className="rounded-full">
            <Avatar isBordered radius="full" size="md" name={author.friendlyName} />
          </Skeleton>
          <div className="flex flex-col gap-1 items-start justify-center">
            <h4 className="text-small font-semibold leading-none text-default-600">{author.friendlyName}</h4>
            <h5 className="text-small tracking-tight text-default-400">@{author.snsName}</h5>
          </div>
        </div>

        {!isHideFollow && <Button
          className={isFollowed ? "bg-transparent text-foreground border-default-200" : ""}
          color="primary"
          radius="full"
          size="sm"
          variant={isFollowed ? "bordered" : "solid"}
          onPress={() => setIsFollowed(!isFollowed)}
        >
          {isFollowed ? "Unfollow" : "Follow"}
        </Button>}
      </CardHeader>
      <CardBody className="px-3 py-0 text-small text-default-400">
        <p className="line-clamp-3 ...">
          {content}
        </p>
      </CardBody>
      <CardFooter className="gap-3">
        <div className="flex gap-1">
          <p className="font-semibold text-default-400 text-small">{kFormatter(author.following.totalCount)}</p>
          <p className=" text-default-400 text-small">Following</p>
        </div>
        <div className="flex gap-1">
          <p className="font-semibold text-default-400 text-small">{kFormatter(author.follower.totalCount)}</p>
          <p className="text-default-400 text-small">Followers</p>
        </div>
      </CardFooter>
    </Card>
  );
}
