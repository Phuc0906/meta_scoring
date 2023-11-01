import React, {useEffect, useState} from "react";
import team1 from '../assests/logo royal.png';
import team2 from '../assests/logo skis.png';
import team3 from '../assests/logo HUTECH.png';
import team4 from '../assests/logo CIS.png';
import {useLocation} from "react-router-dom";
import {MatchProps} from "./HomePage";
import {queryMatches, updateMatchScore, queryMatchById, mutateMatch} from "../graphql/query/Matches";
import {queryBusyTable} from "../graphql/query/Table";
import {registerTable, updateEndMatch, updateGroupStageMatch} from "../graphql/mutation/MatchCRUD";
import {getTeamByName} from "../graphql/mutation/TeamCRUD";
import {API, graphqlOperation} from "aws-amplify";
import {GraphQLResult} from "@aws-amplify/api";
import {getAllMatches} from "../graphql/mutation/MatchCRUD";
import {createTeam} from "../graphql/mutation/TeamCRUD";
import RefereeTimeBoard from "../components/RefereeTimeBoard";
import RefereeMatchBoard from "../components/RefereeMatchBoard";

const img = [team1, team2, team3, team4];

interface TableSelectionProps {
    table: number
}

interface TeamProps {
    board: string,
    brand: number,
    draw: number,
    lose: number,
    team: string,
    team_id: string,
    win: number,
    semi: number
}



const RefereeBoard = () => {
    const location = useLocation();


    return <div>
        {(location.state.individual === 1) ? <RefereeTimeBoard team={location.state.team}/> : <RefereeMatchBoard/>}
    </div>
}

export default RefereeBoard;
