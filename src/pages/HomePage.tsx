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
import {queryTeams} from "../graphql/mutation/TeamCRUD";
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

interface IndividualContainerProps {
    team: APITeamProps
}

const IndividualRoundContainer: React.FC<IndividualContainerProps> = ({team}) => {
    return <div className="bg-[#303030] flex items-center text-center justify-between">
        <div className=" flex gap-8 items-center">
            <div className="w-20 lg:w-32">
                <img src={img[team.brand - 1]}/>
            </div>
            <div className="text-xl lg:text-4xl text-white">
                <label>{team.team}</label>
            </div>
        </div>
        <div className="mr-32 w-80 flex items-center gap-10">
            <div className="w-1/2 text-xl lg:text-4xl text-white">
                <label>{team.score === 1 ? 0 : team.score} s</label>
            </div>
            <div className="w-1/2 text-center bg-red-600 py-2 px-7 rounded-2xl hover:bg-gray-100 active:bg-red-600">
                <Link to={'/score-board'} state={{team: team, individual: 1}} className="w-full">Bắt đầu</Link>
            </div>
        </div>
    </div>
}


const MatchContainer: React.FC<MatchContainerProps> = ({match, teamImg}) => {
    return <div className="mx-14 rounded-xl border-2 border-[#303030] mt-10">
        <div className="text-white text-xl lg:text-4xl w-full text-center border-[#303030] rounded-t-xl py-2">
            <label>Bảng {match.board === 'quarter_1' ? 'Tứ kết 1' : (match.board === 'quarter_2') ? 'Tứ kết 2' : (match.board === 'quarter_3') ? 'Tứ kết 3' : (match.board === 'quarter_4') ? 'Tứ kết 4' : (match.board === 'semi_1') ? 'Bán kết 1' : (match.board === 'semi_2') ? 'Bán kết 2' : (match.board === 'final') ? 'Chung kết' : 'Tranh ba' }</label>
        </div>
        <div className=" flex gap-0 lg:gap-20 items-center border-[#303030]">
            <div className="w-full [#303030] h-fit py-5 text-white flex items-center justify-between px-3 lg:px-14">
                <div className="text-xl lg:text-4xl [#303030] flex items-center justify-start gap-1 lg:gap-5">
                    <div className="w-14 lg:w-28">
                        <img src={teamImg[match.brand1 - 1]} alt={"Team 1"} />
                    </div>
                    <div>
                        <label>{match.team1}</label>
                    </div>
                </div>
                <div className="text-4xl flex gap-4 items-center invisible">
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
                <div className="text-xl lg:text-4xl flex items-center justify-start gap-5">
                    <div>
                        <label>{match.team2}</label>
                    </div>
                    <div className="w-14 lg:w-28">
                        <img src={teamImg[match.brand2 - 1]} alt={"Team 2"} />
                    </div>
                </div>
            </div>
            <div className="w-1/5 pr-5">
                <div className="w-full text-center bg-red-600 py-2 px-7 rounded-2xl hover:bg-gray-100 active:bg-red-600">
                    <Link to={'/score-board'} state={{match: match, individual: 0}} className="w-full">Bắt đầu</Link>
                </div>
            </div>
        </div>
    </div>
}

const HomePage = () => {
    const [teamData, setTeamData] = useState<MatchProps[]>([])
    const [teams, setTeams] = useState<APITeamProps[]>([]);

    useEffect(() => {
        const fetchTeams = async () => {
            const response = await API.graphql(graphqlOperation(queryTeams)) as GraphQLResult<any>;
            const tempTeam = response.data.listMegatonCompetitionTeams.items;
            tempTeam.sort((a: APITeamProps, b: APITeamProps) => {
                // Convert team_id to numbers for numerical comparison
                const teamIdA = parseInt(a.team_id);
                const teamIdB = parseInt(b.team_id);

                return teamIdA - teamIdB;
            });
            console.log(tempTeam.length)
            setTeams(response.data.listMegatonCompetitionTeams.items)
        }

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
        fetch().then(r => console.log(r));
        fetchTeams().then(r => console.log(r));
    }, [])

    return <div className="mt-5">
        <div className=" w-full">
            <div className={`bg-[#222222] mx-0 lg:mx-10 px-4 py-5`}>
                <div className="text-xl lg:text-3xl text-white">
                    <label>Vòng 1</label>
                </div>
                <div className="mt-7">
                    {teams.map((team, index) => <IndividualRoundContainer team={team} key={index} />)}
                </div>
            </div>
        </div>
        <div className=" w-full mt-10">
            <div className={`bg-[#222222] mx-0 lg:mx-10 px-4 py-5`}>
                <div className="text-3xl text-white">
                    <label>Vòng 2</label>
                </div>
                <div className="mt-7">
                    {teamData.map((match, index) => <MatchContainer match={match} teamImg={img} key={index}/>)}
                </div>
            </div>
        </div>
    </div>
}

export default HomePage;
