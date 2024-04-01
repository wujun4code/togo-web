import { useRouteLoaderData } from "@remix-run/react";
import { FC } from 'react';
import { IServerContext } from '../../contracts';
import { Avatar, AvatarFallback, AvatarImage } from "@components/index";
import { Link } from "@remix-run/react";
import { Button } from "@components/index";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@components/index";
import { Form } from '@remix-run/react';

export const NavProfile = () => {

    const rootData = useRouteLoaderData<IServerContext>("root");

    return (
        <>
            {rootData?.user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={rootData.user.togo.avatar} alt="@shadcn" />
                                <AvatarFallback>{rootData.user.togo.friendlyName.length >= 2 ? rootData.user.togo.friendlyName.substring(0, 2) : rootData.user.togo.friendlyName.substring(0, 1)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start" forceMount side="bottom" >
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{rootData.user.togo.friendlyName}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {rootData.user.oauth2.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Form action="/auth/logout" method="post">
                                <Button size='sm' type="submit">Log Out</Button>
                            </Form>
                            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>) : <NavLogInOrSignUp />
            }
        </>
    );
}

export const NavLogInOrSignUp: FC = ({ }) => {

    return (
        <div className="flex">
            <Link to="/login">
                <Button>
                    Log In
                </Button>
            </Link>
            {/* <Link to="/signup">
                <Button >
                    Sign Up
                </Button>
            </Link> */}
        </div>
    )
}