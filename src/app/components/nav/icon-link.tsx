import { Link } from "@remix-run/react";
import { LucideIcon } from "lucide-react";
import { cn } from "@lib";
import React, { useState, FC, useEffect } from "react";
import {
    Home,
    User,
} from "lucide-react";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
    buttonVariants,
} from "@components";

import { IClientContext } from '@contracts';

export type NavLinkProps = {
    title: string;
    label?: string;
    icon: LucideIcon;
    href?: string;
    variant: "default" | "ghost";
}

export interface NavProps {
    links?: NavLinkProps[];
    context: IClientContext;
}

export const NavLinksPanel: FC<NavProps> = (props: NavProps) => {

    const { context } = props;
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
    ];
    const links = props?.links ? props?.links : defaultLinks;

    return (<NavLinks links={links} context={props.context} />)
}

export function NavLinks({ links }: NavProps) {
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
                                    <TooltipContent side="right" className="flex items-center gap-4">
                                        {link.title}
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
                                    "justify-start", "hidden lg:flex"
                                )}>
                                <link.icon className="mr-2 h-4 w-4" />
                                {link.title}
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