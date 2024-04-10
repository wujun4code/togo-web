import React, { useState, FC, useEffect } from "react";
import { Textarea } from "@components/index";
import { Button } from "@components/index";
import { useMutation, useDataSource, useUserState, AsyncLoaderState, useTopic, useQuery } from '../../hooks';
import { GQL } from '../../contracts/graphql';
import { getGqlHeaders, IUserContext } from '../../contracts'
import { motion, AnimatePresence, useAnimate, useMotionValue, useAnimation } from "framer-motion"
import { MentionsInput, Mention, MentionItem } from 'react-mentions';
import defaultStyle from './mention/defaultStyle';
import defaultMentionStyle from './mention/defaultMentionStyle';
interface TypingProps {
    onPost?: (content: string) => void;
    currentUser?: IUserContext
}

export const Typing: FC<TypingProps> = ({ onPost, currentUser: initialCurrentUser }) => {

    const [textareaContent, setTextareaContent] = useState('');
    const { dataSourceConfig } = useDataSource();
    const [currentUser, setCurrentUser] = useState(initialCurrentUser);
    const [buttonText, setButtonText] = useState('Post');
    const [buttonColor, setButtonColor] = useState<`default` | `primary` | `secondary` | `success` | `warning` | `danger`>('primary');

    const { pub } = useTopic();
    const { mutateData, loading, succeeded, hookState, data: addedPost, error } = useMutation(dataSourceConfig.graphql.serverUrl, GQL.CREATE_POST, getGqlHeaders(currentUser));
    const handleButtonClick = () => {

        if (!currentUser) {
            pub('require', 'login', true);
            return;
        }
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

    const [scope, animate] = useAnimate();
    const x = useMotionValue(0)
    const controls = useAnimation();

    useEffect(() => {

        if (loading) {
            setButtonText("Sending...");
        }

        if (error) {
            if (error === 401) {
                pub('require', 'login', true);
            }
        }

        if (succeeded) {
            const { createPost } = addedPost;
            const newPost = {
                id: createPost.id,
                content: textareaContent,
                postedAt: createPost.postedAt,
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


    const handleTextareaChange = (content: string) => {
        setTextareaContent(content);
    };

    const [mentions, setMentions] = useState('');

    const {
        query: suggestingToMentionQuery,
        loading: suggestingToMentionLoading,
        succeeded: suggestingToMentionSucceeded,
        hookState: suggestingToMentionHookState,
        data: suggestingToMentionData
    } = useQuery(dataSourceConfig.graphql.serverUrl, GQL.SUGGESTING_TO_MENTION, getGqlHeaders(currentUser));

    const suggestedMentions = [
        {
            id: 'walter',
            display: '@Walter White',
        },
        {
            id: 'pipilu',
            display: '@皮皮鲁',
        },
        {
            id: 'luxixi',
            display: '@鲁西西',
        },
        {
            id: 'satoshi1',
            display: '@中本聪',
        },
        {
            id: 'satoshi2',
            display: '@サトシ・ナカモト',
        },
        {
            id: 'nobi',
            display: '@野比のび太',
        },
        {
            id: 'sung',
            display: '@성덕선',
        },
        {
            id: 'jesse',
            display: '@Jesse Pinkman',
        },
        {
            id: 'gus',
            display: '@Gustavo "Gus" Fring',
        },
        {
            id: 'saul',
            display: '@Saul Goodman',
        },
        {
            id: 'hank',
            display: '@Hank Schrader',
        },
        {
            id: 'skyler',
            display: '@Skyler White',
        },
        {
            id: 'mike',
            display: '@Mike Ehrmantraut',
        },
        {
            id: '@lydia',
            display: '@Lydìã Rôdarté-Qüayle',
        },
    ];
    const onChange = (event: { target: { value: string } },
        newValue: string,
        newPlainTextValue: string,
        mentions: MentionItem[]) => {
        //console.log('onChange', event.target.value, newValue, newPlainTextValue, mentions);

        setTextareaContent(event.target.value);
    }

    const onAdd = (id: string | number, display: string) => {
        console.log('onAdd', id, display);
    };

    return (
        <>
            <div className="flex flex-col gap-2">
                <MentionsInput
                    disabled={loading}
                    value={textareaContent}
                    onChange={onChange}
                    style={defaultStyle}
                    placeholder={"Mention people using '@'"}
                    a11ySuggestionsListLabel={"Suggested mentions"}>
                    <Mention
                        markup="@[__display__](user:__id__)"
                        trigger="@"
                        data={suggestedMentions}
                        renderSuggestion={(
                            suggestion,
                            search,
                            highlightedDisplay,
                            index,
                            focused
                        ) => (
                            <div className={`user ${focused ? 'focused' : ''}`}>
                                {highlightedDisplay}
                            </div>
                        )}
                        onAdd={onAdd}
                        style={defaultMentionStyle}
                    />
                </MentionsInput>
                {/* <Textarea
                    value={textareaContent}
                    disabled={loading}
                    onChange={e => handleTextareaChange(e.target.value)}
                    placeholder=""
                    className="max-w-2xl" /> */}
                <motion.div className="flex flex-col gap-2"
                    animate={controls}
                    whileTap={{ scale: 0.95 }}>
                    <Button disabled={!textareaContent.trim() || loading}
                        onClick={handleButtonClick}
                        color={buttonColor} size="lg">
                        {buttonText}
                    </Button>
                </motion.div>
            </div>
        </>
    );
}