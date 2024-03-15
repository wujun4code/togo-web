import React, { FC, createContext, useContext, useState } from 'react';
import { User, Button, Image, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import { ClientContextValue, LoaderContext, ServerContextValue, IClientContext, IUserContext } from '../../contracts';
import { useCharactersContext, useUserState } from "../../hooks/user";

export const NavProfile: FC = () => {

    const {
        characterId,
        setCharacterId
    } = useCharactersContext();
    const { currentUserX, setCurrentUserX } = useUserState();

    return currentUserX && currentUserX.accessToken ? (
        <>
            <User
                name={`${currentUserX.togo.friendlyName}+${characterId}`}
                avatarProps={{
                    src: "https://avatars.githubusercontent.com/u/30373425?v=4"
                }}
            />
        </>
    ) :
        (<NavLogInOrSignUp>

        </NavLogInOrSignUp>);
}

export const NavLogInOrSignUp: FC = ({ }) => {
    const {
        characterId,
        setCharacterId
    } = useCharactersContext();

    return (<NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
            <Link href="#">Login</Link>
        </NavbarItem>
        <NavbarItem>
            <Button onClick={() => setCharacterId(characterId - 1)} as={Link} color="primary" href="#" variant="flat">
                Sign Up
            </Button>
        </NavbarItem>
    </NavbarContent>)
}