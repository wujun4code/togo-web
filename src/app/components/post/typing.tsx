import React, { useState, FC, useEffect } from "react";
import { Textarea } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { useMutation, useDataSource, useUserState, AsyncLoaderState, useTopic } from '../../hooks';
import { GQL } from '../../contracts/graphql';
import { getGqlHeaders, IUserContext } from '../../contracts'
import { motion, AnimatePresence, useAnimate, useMotionValue, useAnimation } from "framer-motion"

interface TypingProps {
    onPost?: (content: string) => void;
    currentUser?: IUserContext
}

export const Typing: FC<TypingProps> = ({ onPost, currentUser: initialCurrentUser }) => {

    const [textareaContent, setTextareaContent] = useState('');
    const { dataSourceConfig } = useDataSource();
    const [currentUser, setCurrentUser] = useState(initialCurrentUser);
    const { currentUser: contextCurrentUser } = useUserState();
    const [buttonText, setButtonText] = useState('Post');
    const [buttonColor, setButtonColor] = useState<`default` | `primary` | `secondary` | `success` | `warning` | `danger`>('primary');

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

    const [scope, animate] = useAnimate()
    const x = useMotionValue(0)
    const controls = useAnimation();

    useEffect(() => {

        if (loading) {
            setButtonText("Sending...");
        }

        if (succeeded) {
            const newPost = {
                id: addedPost.id,
                content: textareaContent,
                postedAt: addedPost.postedAt,
            };
            pub('post', 'created', newPost);
            setButtonText("Sent");
            setTextareaContent('');
            setButtonColor("success");
            setTimeout(() => {
                setButtonText("Post");
                setButtonColor("primary");
            }, 600);
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
        <motion.div className="flex flex-col gap-2"
            animate={controls}
            whileTap={{ scale: 0.95 }}>
            <Button isDisabled={!textareaContent.trim() || loading}
                onClick={handleButtonClick}
                color={buttonColor} size="lg">
                {buttonText}
            </Button>
        </motion.div>

    </div>);
}