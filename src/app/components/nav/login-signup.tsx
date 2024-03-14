import React, { FC, createContext, useContext, useState } from 'react';
import { User, Button, Image, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import { ClientContextValue, LoaderContext, ServerContextValue, IClientContext, IUserContext } from '../../contracts';

interface AuthProps {
    currentUser: IUserContext | null;
    setCurrentUser: React.Dispatch<React.SetStateAction<IUserContext | null>>;
}

export const NavProfile: FC<AuthProps> = ({ currentUser, setCurrentUser }) => {

    return currentUser ? (
        <User
            name={currentUser.togo.friendlyName}
            avatarProps={{
                src: "https://avatars.githubusercontent.com/u/30373425?v=4"
            }}
        />
    ) :
        (<NavLogInOrSignUp>

        </NavLogInOrSignUp>);
}

export const NavLogInOrSignUp: FC = ({ }) => {
    return (<NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
            <Link href="#">Login</Link>
        </NavbarItem>
        <NavbarItem>
            <Button as={Link} color="primary" href="#" variant="flat">
                Sign Up
            </Button>
        </NavbarItem>
    </NavbarContent>)
}