import { Link } from "@remix-run/react";
import { LucideIcon } from "lucide-react";
import { cn } from "@lib";
import React, { useState, FC, useEffect } from "react";
import { useMutation, useDataSource, useUserState, AsyncLoaderState, useTopic, useQuery, useDataQuery, useSubscription } from "@hooks";
import { getGqlHeaders, IClientContext } from "@contracts";
import { GQL } from "@GQL";
import {
    Home,
    User,
} from "lucide-react";
import { useOutletContext } from "@remix-run/react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
    buttonVariants,
} from "@components";

import { VscMention } from "react-icons/vsc";
import { FaRegComment } from "react-icons/fa";
import { IconType } from "react-icons";


export type NavLinkProps = {
    title: string;
    label?: string;
    icon: LucideIcon | IconType;
    href?: string;
    variant: "default" | "ghost";
}

export interface NavProps {
    links?: NavLinkProps[];
    context: IClientContext;
}

export const NavLinksPanel: FC<NavProps> = (props: NavProps) => {

    const { context } = props;

    const {
        query: unreadMentionedCountQuery,
        loading: unreadMentionedLoading,
        succeeded: unreadMentionedSucceeded,
        hookState: unreadMentionedHookState,
        data: unreadMentionedData
    } = useDataQuery(GQL.UNREAD_MENTIONED_NOTIFICATION_COUNT);

    const { currentUser, setCurrentUser, loadingState, setLoadingState } = useUserState();

    const outletContext = useOutletContext<IClientContext>();

    const [unreadMentionedCount, setUnreadMentionedCount] = useState<string>('');
    const [unreadCommentCount, setCommentCount] = useState<string>('');
    const { on, off, pub } = useTopic();

    const handleOnNextMentionedData = (data: any) => {
        setUnreadMentionedCount(prev => {
            return (prev ? parseInt(prev) + 1 : 1).toString();
        });
    }

    const handleOnNextCommentData = (data: any) => {
        setCommentCount(prev => {
            return (prev ? parseInt(prev) + 1 : 1).toString()
        });
    }

    if (outletContext.user) {

        // useSubscription(outletContext.dataSources.graphql.subscriptionUrl,
        //     GQL.MENTIONED_CREATED,
        //     'mentionedCreated',
        //     null,
        //     handleOnNextMentionedData,1
        //     getGqlHeaders(outletContext.user));

        useSubscription(outletContext.dataSources.graphql.subscriptionUrl,
            GQL.SUBSCRIPTION_UNREAD_MENTIONED_CREATED,
            'unreadMentionedNotificationCreated',
            'icon-links',
            null,
            handleOnNextMentionedData,
            getGqlHeaders(outletContext.user));

        useSubscription(outletContext.dataSources.graphql.subscriptionUrl,
            GQL.SUBSCRIPTION_COMMENT_CREATED,
            'commentCreated',
            'icon-links',
            null,
            handleOnNextCommentData,
            getGqlHeaders(outletContext.user));
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { unreadNotification: { unreadMentioned } } = await unreadMentionedCountQuery();
                setUnreadMentionedCount(unreadMentioned?.totalCount);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        if (outletContext.user) {
            fetchData();
        }

        const callback = (payload: any) => {
            setUnreadMentionedCount(prev => {
                return (parseInt(prev) + 1).toString();
            });
        };
        // on('unreadMentionedNotificationCreated', 'next', 'nav-links', callback);
        // return () => {
        //     off('unreadMentionedNotificationCreated', 'next', 'nav-links', callback);
        // };
    }, [outletContext.user, on]);

    const defaultLinks: NavLinkProps[] = [
        {
            title: "Home",
            label: "",
            icon: Home,
            variant: "default",
        },
        {
            title: "Profile",
            label: "",
            icon: User,
            variant: "ghost",
            href: context.user ? `${context.user.togo.snsName}` : '/login'
        },
        {
            title: "Mentioned",
            label: unreadMentionedCount,
            icon: VscMention,
            variant: "ghost",
            href: context.user ? `/mentioned` : '/login'
        },
        {
            title: "Comments",
            label: unreadCommentCount,
            icon: FaRegComment,
            variant: "ghost",
            href: context.user ? `/mentioned` : '/login'
        },
    ];

    const links = props?.links ? props?.links : defaultLinks;

    return (
        <>
            <NavLinks links={links} context={props.context} />
        </>)
}

export function NavLinks({ links, context }: NavProps) {

    return (
        <>
            {links && <div className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2 fixed">
                <nav className="flex flex-col gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
                    {links.map((link, index) => (
                        <div key={index}>
                            <TooltipProvider>
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            to={link.href ? link.href : '/'}
                                            className={cn(
                                                buttonVariants({ variant: link.variant, size: "icon" }),
                                                "h-9 w-9",
                                                link.variant === "default" &&
                                                "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white",
                                                "block sm:flex lg:hidden flex"
                                            )}>
                                            <link.icon className="h-4 w-4" />
                                            <span className="sr-only">{link.title}</span>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="flex gap-4">
                                        <span> {link.title}</span>
                                        {link.label && (
                                            <span className="ml-auto text-muted-foreground">
                                                {link.label}
                                            </span>
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <Link
                                to={link.href ? link.href : '/'}
                                className={cn(
                                    buttonVariants({ variant: link.variant, size: "sm" }),
                                    link.variant === "default" &&
                                    "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                                    "justify-start", "hidden lg:flex lg:gap-1"
                                )}>
                                <link.icon className="h-4 w-4" />
                                <span> {link.title}</span>
                                {link.label && (
                                    <span
                                        className={cn(
                                            "ml-auto",
                                            link.variant === "default" &&
                                            "text-background dark:text-white"
                                        )}>
                                        {link.label}
                                    </span>
                                )}
                            </Link>
                        </div>
                    )
                    )}
                </nav>
            </div>}
        </>
    )
}