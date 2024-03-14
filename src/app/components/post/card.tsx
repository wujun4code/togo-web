import React, { FC } from "react";
import { Card, CardHeader, CardBody, CardFooter, Avatar, Button } from "@nextui-org/react";
import { IClientContext } from '../../contracts/context';

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
  clientContext: IClientContext;
}

export const PostCard: FC<PostCardProps> = ({ author, content, postedAt, clientContext }) => {

  const [isFollowed, setIsFollowed] = React.useState(author.followed ? author.followed : false);

  const userInfo = "";

  const currentUserOpenId = "";

  const [isHideFollow, setIsHideFollow] = React.useState(currentUserOpenId === author.openId);

  function kFormatter(num: number): string {
    return Math.abs(num) > 999
      ? `${Math.sign(num) * parseInt((Math.abs(num) / 1000).toFixed(1))}k`
      : `${Math.sign(num) * Math.abs(num)}`;
  }

  return (
    <Card className="">
      <CardHeader className="justify-between">
        <div className="flex gap-5">
          <Avatar isBordered radius="full" size="md" name={author.friendlyName} />
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
        <p>
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
