import React, { FC, createContext, useContext, useState, useEffect } from 'react';
import { User, Button, Image, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import { ClientContextValue, LoaderContext, ServerContextValue, IClientContext, IUserContext } from '../../contracts';
import { useCharactersContext, useUserState } from "../../hooks/user";
import { Card, Skeleton } from "@nextui-org/react";

export const NavProfile: FC = () => {

    const { currentUser: currentUserX, setCurrentUser: setCurrentUserX } = useUserState();

    const [isLoaded, setIsLoaded] = React.useState(false);

    useEffect(() => {
        if (currentUserX && currentUserX.accessToken) {
            setIsLoaded(true);
        }
    }, [currentUserX]);

    return (
        <>
            <Skeleton isLoaded={isLoaded} className="rounded-lg">
                {currentUserX && currentUserX.accessToken ? <User
                    name={`${currentUserX.togo.friendlyName}`}
                    avatarProps={{
                        src: "https://avatars.githubusercontent.com/u/30373425?v=4"
                    }}
                /> : (<NavLogInOrSignUp />)}
            </Skeleton>
        </>
    );
}

export const NavLogInOrSignUp: FC = ({ }) => {

    return (<NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
            <Link href="#">Login</Link>
        </NavbarItem>
        <NavbarItem>
            <Button onClick={() => { }} as={Link} color="primary" href="#" variant="flat">
                Sign Up
            </Button>
        </NavbarItem>
    </NavbarContent>)
}