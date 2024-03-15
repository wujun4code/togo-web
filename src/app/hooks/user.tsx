import React, {
    useState,
    createContext,
    useContext,
    Dispatch,
    SetStateAction,
    ReactNode
} from "react";


import { IUserContext } from '../contracts/context';

type UserContextType = {
    currentUserX: IUserContext;
    setCurrentUserX: React.Dispatch<React.SetStateAction<IUserContext>>;
}

export const UserContext = createContext<UserContextType>({} as UserContextType);
export const useUserState = () => useContext(UserContext);

interface Props {
    children: React.ReactNode;
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
    // 初始化用户状态
    const [currentUserX, setCurrentUserX] = useState<IUserContext>({
        accessToken: '',
        oauth2: {
            sub: '',
            roles: [],
            resource: '',
        },
        togo: {
            openId: '',
            friendlyName: '',
            snsName: '',
        }
    });

    return (
        <UserContext.Provider value={{ currentUserX, setCurrentUserX }}>
            {children}
        </UserContext.Provider>
    );
}

type CharactersId = {
    characterId: number;
    setCharacterId: Dispatch<SetStateAction<number>>;
};

export const Context = createContext<CharactersId>({} as CharactersId);

export const CharactersContext = ({ children }: { children: ReactNode }) => {
    const [characterId, setCharacterId] = useState(1);

    return (
        <Context.Provider value={{ characterId, setCharacterId }}>
            {children}
        </Context.Provider>
    );
};

export const useCharactersContext = () => useContext(Context);
