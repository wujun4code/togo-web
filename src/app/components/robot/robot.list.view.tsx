import { AvatarProfileCard, RobotAvatarCardList } from "@components";
import React, { FC, useState, useEffect } from "react";
import { IClientContext, AvatarProfile, EdgeConnection, Robot } from '@contracts';
import { useOutletContext } from "@remix-run/react";
import { useMutation, useDataSource, useUserState, AsyncLoaderState, useTopic, useQuery, useDataQuery, useSubscription } from "@hooks";
import { GQL } from "@GQL";

interface RobotListViewInput {
    managingUserSnsName: string;
}

interface RobotListViewProps {
    input: RobotListViewInput;
}

export const RobotListView: FC<RobotListViewProps> = ({ input }) => {

    const outletContext = useOutletContext<IClientContext>();
    if (!outletContext.user) return <></>;

    const {
        query: publicSnsProfileQuery,
        loading: publicSnsProfileLoading,
        succeeded: publicSnsProfileSucceeded,
        hookState: publicSnsProfileHookState,
        data: publicSnsProfileData
    } = useDataQuery(GQL.GET_PUBLIC_SNS_PROFILE);

    const {
        query: userRobotQuery,
        loading: userRobotLoading,
        succeeded: userRobotSucceeded,
        hookState: userRobotHookState,
        data: userRobotData
    } = useDataQuery(GQL.USER_ROBOT);

    const [managingUser, setManagingUser] = useState<AvatarProfile>();
    const [robotConnection, setRobotConnection] = useState<EdgeConnection<Robot>>();

    useEffect(() => {

        const fetchPublicSnsProfileQuery = async () => {
            try {
                const { publicProfile } = await publicSnsProfileQuery({
                    "input": {
                        "snsName": input.managingUserSnsName,
                    }
                });
                setManagingUser(publicProfile);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        const fetchUserRobotQuery = async () => {
            try {
                const { userRobot: { managingRobots } } = await userRobotQuery({
                    "input": {
                        "snsName": input.managingUserSnsName,
                    }
                });
                setRobotConnection(managingRobots);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        if (outletContext.user) {
            fetchUserRobotQuery();
        }
    }, [input, input.managingUserSnsName, outletContext.user]);

    if (!robotConnection) return <></>;

    return (
        <RobotAvatarCardList managingUser={managingUser} robotConnection={robotConnection} >

        </RobotAvatarCardList>
    );
}