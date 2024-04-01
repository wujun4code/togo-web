import { Button } from "@components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@components/ui/dialog"
import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import { FaRegComment } from "react-icons/fa6";
import React, { FC, useState } from "react";
import { AvatarSNS } from '@components/index';
import { useMutation, useDataSource, useUserState, AsyncLoaderState, useTopic } from '../../hooks';
import { Textarea } from "@components/index";
import { GQL } from '../../contracts/graphql';
import { createContext, useContext, useEffect } from 'react';
import { getGqlHeaders, IUserContext } from '../../contracts';


export interface CommentAddDialogProps {
    onComment?: (content: string) => void;
    postId: string;
    threadId?: string;
    replyToId?: string;
}

export const CommentAddDialog: FC<CommentAddDialogProps> = ({ onComment, postId }) => {

    const { currentUser, setCurrentUser, loadingState, setLoadingState } = useUserState();
    const [textareaContent, setTextareaContent] = useState('');
    const { dataSourceConfig, setDataSourceConfig } = useDataSource();
    const { mutateData, loading, succeeded, hookState, data: addedPost } = useMutation(dataSourceConfig.graphql.serverUrl, GQL.CREATE_COMMENTS, 'createComment', null, getGqlHeaders(currentUser));
    const { pub } = useTopic();
    const [buttonText, setButtonText] = useState('Reply');

    const [open, setOpen] = React.useState(false);

    const handleButtonClick = () => {
        if (onComment) {
            onComment(textareaContent);
        }
        else {
            mutateData({
                "input": {
                    "content": textareaContent,
                    "postId": postId,
                }
            });
        }
    };

    const handleTextareaChange = (content: string) => {
        setTextareaContent(content);
    };

    useEffect(() => {

        if (loading) {
            setButtonText("Replying...");
        }

        if (succeeded) {
            const newPost = {
                id: addedPost.id,
                content: textareaContent,
                postedAt: addedPost.postedAt,
            };
            pub('comment', 'created', newPost);
            setButtonText("Replied");
            setTextareaContent('');

            setTimeout(() => {
                setOpen(false);
                setButtonText("Reply");
            }, 300);
        }
    }, [hookState]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="hover:text-sky-500" variant="outline" size="icon">
                    <FaRegComment />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Reply and comment </DialogTitle>
                    {/* <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription> */}
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        value={textareaContent}
                        onChange={e => handleTextareaChange(e.target.value)}
                        placeholder=""
                        className="max-w-2xl" />
                </div>
                <DialogFooter>
                    <Button disabled={!textareaContent.trim() || loading} onClick={handleButtonClick}>{buttonText}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
