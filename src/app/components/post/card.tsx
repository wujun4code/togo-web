import {
  Button, Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@components/index";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@components/index"
import { BiRepost } from "react-icons/bi";
import { FaRegComment } from "react-icons/fa6";
import { AiOutlineLike, AiOutlineDislike } from "react-icons/ai";
import { Separator } from "@components/index"
import { CommentAddDialog, AvatarSNS, RenderContent } from '@components/index';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@components/ui/drawer";


import React, { FC, useState } from "react";
import { IUserContext } from '../../contracts/context';
import {
  ChevronDownIcon,
  CircleIcon,
  PlusIcon,
  StarIcon,
} from "@radix-ui/react-icons"
import { Link, useNavigate } from "@remix-run/react";
import { useOutletContext } from "@remix-run/react";
import { getGqlHeaders, IClientContext } from "@contracts";
import { useMutation, useDataSource, useUserState, AsyncLoaderState, useTopic, useQuery, useDataQuery, useSubscription } from "@hooks";
import { GQL } from "@GQL";

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
  avatar?: string;
  bio?: string;
}

export interface PostCardProps {
  content: string;
  postedAt: Date;
  author: Author;
  id: string;
  currentUser?: IUserContext
  aggregatedInfo?: any;
}

export const PostCard: FC<PostCardProps> = ({ id, author, content, postedAt, currentUser: initialCurrentUser, aggregatedInfo }) => {

  const [isFollowed, setIsFollowed] = React.useState(author.followed ? author.followed : false);
  const [user, setUser] = useState(initialCurrentUser);
  const { currentUser, setCurrentUser, loadingState, setLoadingState } = useUserState();
  const currentUserOpenId = '';

  const [commentCount, setCommentCount] = React.useState<number>(aggregatedInfo?.comment?.totalCount ? aggregatedInfo?.comment?.totalCount : 0);


  const [isHideFollow, setIsHideFollow] = React.useState(currentUserOpenId === author.openId);

  const labels = [
    {
      value: "bug",
      label: "Bug",
    },
    {
      value: "feature",
      label: "Feature",
    },
    {
      value: "documentation",
      label: "Documentation",
    },
  ]

  const handleCardClick = (id: string) => {

  }

  const navigate = useNavigate();

  const handleCardContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    //navigate(`/post/${id}`);
    e.preventDefault();
    navigate(`/post/${id}`);
  }
  const outletContext = useOutletContext<IClientContext>();

  const handleOnComingCommentData = (data: any) => {
    console.log('card', 'handleOnComingCommentData', data);
    const { id: nextPostId } = data.post;
    console.log('nextPostId', nextPostId, id);
    if (nextPostId === id.toString()) {
      console.log('nextPostId', nextPostId, id.toString());
      setCommentCount(prev => prev + 1);
    }
  }

  if (outletContext.user) {

    useSubscription(outletContext.dataSources.graphql.subscriptionUrl,
      GQL.SUBSCRIPTION_COMMENT_CREATED,
      'commentCreated',
      `post-card-${id}`,
      null,
      handleOnComingCommentData,
      getGqlHeaders(outletContext.user));
  }

  return (
    <>

      <Card className="hover:bg-gray-100">
        <CardHeader className="flex flex-row gap-4 space-y-0 justify-between p-2 px-4 pt-6 pb-2">
          <AvatarSNS {...author} currentUser={user} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted justify-self-end">
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Make a copy</DropdownMenuItem>
              <DropdownMenuItem>Favorite</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value="xxx">
                    {labels.map((label) => (
                      <DropdownMenuRadioItem key={label.value} value={label.value}>
                        {label.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Delete
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </CardHeader>

        <CardContent onClick={e => handleCardContentClick(e)} className="cursor-pointer p-2 px-4 pt-2">
          {/* <p>{content}</p> */}
          <RenderContent text={content} currentUser={user} />
        </CardContent>
        <CardFooter className="p-2 px-4 pt-2">
          <CommentAddDialog postId={id} commentCount={commentCount} />
          {/* <Button className="hover:text-sky-500" variant="outline" size="icon">
            <FaRegComment />
          </Button> */}
          <Button className="hover:text-green-500" variant="outline" size="icon">
            <BiRepost />
          </Button>
          <Button className="hover:text-blue-500" variant="outline" size="icon">
            <AiOutlineLike />
          </Button>
          <Button className="hover:text-red-500" variant="outline" size="icon">
            <AiOutlineDislike />
          </Button>
        </CardFooter>
      </Card>

    </>
  );
}
