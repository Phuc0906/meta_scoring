import React, {useEffect, useState} from "react";
import team1 from '../assests/logo royal.png';
import team2 from '../assests/logo skis.png';
import team3 from '../assests/logo HUTECH.png';
import team4 from '../assests/logo CIS.png';
import {useLocation} from "react-router-dom";
import RefereeTimeBoard from "../components/RefereeTimeBoard";
import RefereeMatchBoard from "../components/RefereeMatchBoard";
import RefereeRacingBoard from "../components/RefereeRacingBoard";
import RefereeSumoMatchBoard from "../components/RefereeSumoMatchBoard";

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
        {(location.state.individual === 1) ? <RefereeTimeBoard team={location.state.team}/> : (location.state.individual === 0) ? <RefereeSumoMatchBoard/> : <RefereeRacingBoard team={location.state.team} round={location.state.round}/> }
    </div>
}

export default RefereeBoard;
