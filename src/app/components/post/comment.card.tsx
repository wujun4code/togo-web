import {
    Button, Card,
    CardContent,
    CardHeader,
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
    DropdownMenuTrigger
} from "@components/index";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

import { AvatarSNS } from '@components/index';
import { IUserContext, PostCommentConnection } from '@contracts';
import { Link } from "@remix-run/react";
import { FC } from "react";

export type CommentAuthor = {
    avatar?: string;
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

export interface CommentProps {
    postId: string;
    content: string;
    createdAt: string;
    author: CommentAuthor;
    id: string;
    currentUser?: IUserContext
}

export interface CommentListProps {
    postId: string;
    commentConnection: PostCommentConnection;
    currentUser?: IUserContext
}

export const CommentListCards: FC<CommentListProps> = ({ commentConnection, postId, currentUser }) => {
    const comments = commentConnection.edges.map(i => {
        return {
            ...i.node,
            postId: postId,
            author: {
                ...i.node.authorInfo,
                followed: false,
                followingMe: false
            },
            currentUser
        };
    });

    return <>
        {!comments ? (<></>) : (
            comments.map((comment) => {
                return (<CommentItemCard key={comment.id} {...comment}></CommentItemCard>
                );
            })
        )}
    </>
}

export const CommentItemCard: FC<CommentProps> = ({ postId, id, author, content, createdAt, currentUser }) => {

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

    return (
        <>

            <Card onClick={e => handleCardClick(id)} className="hover:bg-gray-100">
                <CardHeader className="flex flex-row gap-4 space-y-0 justify-between">
                    <div className="space-y-1">
                        {/* <CardTitle>shadcn/ui</CardTitle> */}
                        <AvatarSNS {...author} currentUser={currentUser} />

                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted justify-self-end"
                            >
                                <DotsHorizontalIcon className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
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
                <Link to={`/post/${postId}/comments/${id}`}>
                    <CardContent>
                        <p>{content}</p>
                    </CardContent>
                </Link>
            </Card>

        </>
    );
}
