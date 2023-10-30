import React, {useEffect, useState} from "react";
import team1 from '../assests/logo royal.png';
import team2 from '../assests/logo skis.png';
import team3 from '../assests/logo HUTECH.png';
import team4 from '../assests/logo CIS.png';
import {Link} from "react-router-dom";
import {API, graphqlOperation} from "aws-amplify";
import {queryMatches} from "../graphql/query/Matches";
import {getAllMatches} from "../graphql/mutation/MatchCRUD";
import { GraphQLResult } from "@aws-amplify/api";
import {APITeamProps} from "./Teams";

export const img = [team1, team2, team3, team4];

export interface MatchProps {
    match_id: string,
    team1: string,
    brand1: number,
    score1: number,
    team2: string,
    brand2: number,
    score2: number,
    live: number,
    board: string,
    table: number
}


interface MatchContainerProps {
    match: MatchProps
    teamImg: string[]
}


const MatchContainer: React.FC<MatchContainerProps> = ({match, teamImg}) => {
    return <div className="mx-14 rounded-xl border-2 border-[#222222] mt-10">
        <div className="text-white text-4xl w-full text-center bg-[#222222] rounded-t-xl py-2">
            <label>Bảng {match.board}</label>
        </div>
        <div className="flex gap-20 items-center">
            <div className="w-full h-fit py-5 text-white flex items-center justify-between px-14">
                <div className="text-4xl flex items-center justify-start gap-5">
                    <div className="w-28">
                        <img src={teamImg[match.brand1 - 1]} alt={"Team 1"} />
                    </div>
                    <div>
                        <label>{match.team1}</label>
                    </div>
                </div>
                <div className="text-4xl flex gap-4 items-center">
                    <div>
                        <label>{match.score1 - 1}</label>
                    </div>
                    <div>
                        <label>-</label>
                    </div>
                    <div>
                        <label>{match.score2 - 1}</label>
                    </div>
                </div>
                <div className="text-4xl flex items-center justify-start gap-5">
                    <div>
                        <label>{match.team2}</label>
                    </div>
                    <div className="w-28">
                        <img src={teamImg[match.brand2 - 1]} alt={"Team 2"} />
                    </div>
                </div>
            </div>
            <div className="w-1/5 pr-5">
                <div className="w-full text-center bg-red-600 py-2 px-7 rounded-2xl hover:bg-gray-100 active:bg-red-600">
                    <Link to={'/score-board'} state={{match: match}} className="w-full">Bắt đầu</Link>
                </div>
            </div>
        </div>
    </div>
}

const HomePage = () => {
    const [teamData, setTeamData] = useState<MatchProps[]>([])

    useEffect(() => {
        const fetch = async () => {
            try {
                const response = await API.graphql(graphqlOperation(getAllMatches)) as GraphQLResult<any>;
                // setTeamData(response.data.listGameMatches.items);
                // setTeamData(response.data?.listMetaCompetitionMatches.items);
                console.log(response.data?.listMegatonMatches.items);
                const matchTemp = response.data?.listMegatonMatches.items
                matchTemp.sort((a: MatchProps, b: MatchProps) => parseInt(a.match_id, 10) - parseInt(b.match_id, 10));
                setTeamData(matchTemp);
            }catch (err) {
                console.error(err)
            }
        }
        fetch();
    }, [])

    return <div className="mt-5">
        <div>
            {teamData.map((match, index) => <MatchContainer match={match} teamImg={img} key={index}/>)}
        </div>
    </div>
}

export default HomePage;
