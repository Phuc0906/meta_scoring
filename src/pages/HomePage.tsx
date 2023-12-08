import React, {useEffect, useState} from "react";
import team1 from '../assests/logo royal.png';
import team2 from '../assests/logo skis.png';
import team3 from '../assests/logo HUTECH.png';
import team4 from '../assests/logo CIS.png';
import {API, graphqlOperation} from "aws-amplify";
import DroneRaceContainer from "../components/DroneRaceContainer";
import { GraphQLResult } from "@aws-amplify/api";
import {queryTeams} from "../graphql/mutation/TeamCRUD";
import {APITeamProps} from "./Teams";
import {checkMatchExitByCategory, groupByGroup} from "../utils/utils";
import MicromouseRacing from "../components/MicromouseRacing";
import {getAllMatches} from "../graphql/mutation/MatchCRUD";
import MatchContainer, {MatchProps} from "../components/MatchContainer";
import SUMO from "../components/SUMO";

export const img = [team1, team2, team3, team4];



const HomePage = () => {


    return <div className="mt-5 mb-20">
        <SUMO category={"GROUP_SUMO_UNI_A"}/>
        <SUMO category={"GROUP_SUMO_UNI_B"}/>
        <SUMO category={"GROUP_SUMO_UNI_C"}/>
        <SUMO category={"GROUP_SUMO_UNI_D"}/>
        <SUMO category={"SUMO_UNI_quarter"}/>
        <SUMO category={"SUMO_UNI_semi"}/>
        <SUMO category={"SUMO_UNI_final"}/>
        <SUMO category={"SUMO_UNI_third"}/>
        <MicromouseRacing round={1} category={"DRONE_UNI"}/>
        <MicromouseRacing round={2} category={"DRONE_UNI"}/>
        {/*<MicromouseRacing round={1} category={"RACING"}/>*/}
        {/*<MicromouseRacing round={2} category={"RACING"}/>*/}
    </div>
}

export default HomePage;
