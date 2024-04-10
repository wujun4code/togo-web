import React, { FC } from 'react';
import { Link } from "@remix-run/react";
import { MentionLinkHoverProfile } from '@components';
import { IUserContext } from '@contracts';

export type ContentType = 'text' | 'image' | 'video' | 'audio' | 'link' | 'quote' | 'code' | 'mention';

export type EmbedContentType = {
    type: ContentType;
    meta: any;
    value: any;
}

export interface Mention {
    type: 'u' | 'uoid' | 'usns';
    id: string;
    displayName: string;
}

const parseText = (text: string): EmbedContentType[] => {
    const mentionRegex = /@\[@(.*?)\]\(user:(.*?)\)/g;
    const mentions: EmbedContentType[] = [];
    let lastIndex = 0;
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
        const displayName = match[1];
        const id = match[2];
        const mention: Mention = { id, displayName, type: 'usns' };
        const preText = text.substring(lastIndex, match.index);
        if (preText) {
            mentions.push({ type: 'text', meta: preText, value: preText });
        }
        mentions.push({ type: 'mention', meta: match[0], value: mention });
        lastIndex = mentionRegex.lastIndex;
    }
    const remainingText = text.substring(lastIndex);
    if (remainingText) {
        mentions.push({ type: 'text', meta: remainingText, value: remainingText });
    }
    return mentions;
};

interface RenderContentProps {
    text: string;
    currentUser?: IUserContext;
}

export const MentionLink: FC<{ mention: Mention }> = ({ mention }) => {

    const { id, type, displayName } = mention;
    const snsName = type === 'usns' ? id : undefined;

    return (
        <Link className='text-blue-600' to={`/${snsName}`}>@{displayName}</Link>
    );
}

const EmbedContent: React.FC<{ content: EmbedContentType, currentUser?: IUserContext }> = ({ content, currentUser }) => {
    switch (content.type) {
        case 'text':
            return <span>{content.value}</span>;
        case 'mention':
            return <MentionLinkHoverProfile mention={content.value as Mention} currentUser={currentUser} />;
        default:
            return <></>;
    }
};

const RenderEmbedContent: React.FC<{ contents: EmbedContentType[], currentUser?: IUserContext }> = ({ contents, currentUser }) => {
    return (
        <>
            {contents.map((content, index) => (
                <React.Fragment key={index}>
                    <EmbedContent key={index} content={content} currentUser={currentUser} />
                </React.Fragment>
            ))}
        </>
    );
};

export const RenderContent: React.FC<RenderContentProps> = ({ text, currentUser }) => {
    const contents = parseText(text);
    return <RenderEmbedContent contents={contents} currentUser={currentUser} />;
};