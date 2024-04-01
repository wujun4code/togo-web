import React, {
    useState,
    createContext,
    useContext,
    Dispatch,
    SetStateAction,
    ReactNode
} from "react";


import { IUserContext } from '../contracts/context';

export enum LoadingState {
    Init = 'init',
    Loading = 'loading',
    Loaded = 'loaded',
}

type UserContextType = {
    currentUser: IUserContext;
    setCurrentUser: React.Dispatch<React.SetStateAction<IUserContext>>;
    loadingState: LoadingState;
    setLoadingState: React.Dispatch<React.SetStateAction<LoadingState>>;
}

export const UserContext = createContext<UserContextType>({} as UserContextType);
export const useUserState = () => useContext(UserContext);

interface Props {
    children: React.ReactNode;
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
    // 初始化用户状态
    const [currentUser, setCurrentUser] = useState<IUserContext>({
        accessToken: '',
        oauth2: {
            sub: '',
            roles: [],
            resource: '',
            email: '',
            clientId: '',
            provider: '',
        },
        togo: {
            friendlyName: '',
            snsName: '',
            follower: {},
            following: {},
            openId: '',
        },
    });

    const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.Init);

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser, loadingState, setLoadingState }}>
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
