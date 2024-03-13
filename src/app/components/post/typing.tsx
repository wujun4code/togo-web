import React, { useState, FC } from "react";
import { Textarea } from "@nextui-org/react";
import { Button } from "@nextui-org/react";

interface TypingProps {
    onPost?: (content: string) => void;
}

export const Typing: FC<TypingProps> = ({ onPost }) => {
    const [textareaContent, setTextareaContent] = useState('');

    const handleButtonClick = () => {
        if (onPost) {
            onPost(textareaContent);
        }
    };

    const handleTextareaChange = (e: string) => {
        setTextareaContent(e);
    };

    return (<div className="flex flex-col gap-2">
        <Textarea
            //value={textareaContent}
            onValueChange={handleTextareaChange}
            label="What's your next ToGo?"
            placeholder=""
            className="max-w-2xl" />
        <Button isDisabled={!textareaContent.trim()} color="primary" size="lg">
            Post
        </Button>
    </div>);
}