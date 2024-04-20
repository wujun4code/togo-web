import { EdgeConnection, AvatarProfile } from '@contracts';

export interface Robot {
    id: string;
    hookUrl: string;
    website: string;
    relatedUser: AvatarProfile,
}

export interface UserRobotConnection extends EdgeConnection<Robot> {

}

export type UserRobot = {
    managingRobots: UserRobotConnection;
} 
