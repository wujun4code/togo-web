import React, { useState, FC, useEffect } from "react";
import { Textarea } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { useMutation, useDataSource, useUserState, AsyncLoaderState, useTopic } from '../../hooks';
import { GQL } from '../../contracts/graphql';
import { getGqlHeaders, IUserContext } from '../../contracts'

interface TypingProps {
    onPost?: (content: string) => void;
    currentUser?: IUserContext
}

export const Typing: FC<TypingProps> = ({ onPost, currentUser: initialCurrentUser }) => {

    const [textareaContent, setTextareaContent] = useState('');
    const { dataSourceConfig } = useDataSource();
    const [currentUser, setCurrentUser] = useState(initialCurrentUser);
    const { currentUser: contextCurrentUser } = useUserState();

    const { pub } = useTopic();
    const { mutateData, loading, succeeded, hookState, data: addedPost } = useMutation(dataSourceConfig.graphql.serverUrl, GQL.CREATE_POST, 'createPost', null, getGqlHeaders(currentUser));
    const handleButtonClick = () => {
        if (onPost) {
            onPost(textareaContent);
        }
        else {
            mutateData({
                "input": {
                    "content": textareaContent,
                    "published": true
                }
            });
        }
    };

    useEffect(() => {
        if (succeeded) {
            const newPost = {
                id: addedPost.id,
                content: textareaContent,
                postedAt: addedPost.postedAt,
            };

            console.log(`addedPost:${JSON.stringify(newPost)}`);
            pub('post', 'created', newPost);
            setTextareaContent('');
        }
    }, [hookState]);


    const handleTextareaChange = (e: string) => {
        setTextareaContent(e);
    };

    return (<div className="flex flex-col gap-2">
        <Textarea
            value={textareaContent}
            isDisabled={loading}
            onValueChange={handleTextareaChange}
            label="What's your next ToGo?"
            placeholder=""
            className="max-w-2xl" />
        <Button isDisabled={!textareaContent.trim() || loading}
            onClick={handleButtonClick}
            color="primary" size="lg">
            Post
        </Button>
    </div>);
}