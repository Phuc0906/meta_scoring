import React from "react";
import {Link} from "react-router-dom";
import {img} from "../pages/HomePage";

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
    return <div className="mx-14 rounded-xl border-2 border-[#303030] mt-10">
        <div className="text-white text-xl lg:text-4xl w-full text-center border-[#303030] rounded-t-xl py-2">
            <label>SUMO {match.board} - {match.match_id} </label>
        </div>
        <div className=" flex gap-0 lg:gap-20 items-center border-[#303030]">
            <div className="w-full [#303030] h-fit py-5 text-white flex items-center justify-between px-3 lg:px-14">
                <div className="text-sm lg:text-xl lg:text-4xl [#303030] flex items-center justify-start gap-1 lg:gap-5">
                    <div className="w-8 lg:w-24">
                        <img src={teamImg[match.brand1 - 1]} alt={"Team 1"} />
                    </div>
                    <div>
                        <label>{match.team1}</label>
                    </div>
                </div>
                <div className="text-lg lg:text-xl flex gap-4 items-center">
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
                <div className="text-lg lg:text-xl lg:text-4xl flex items-center justify-start gap-5">
                    <div>
                        <label>{match.team2}</label>
                    </div>
                    <div className="w-8 lg:w-24">
                        <img src={teamImg[match.brand2 - 1]} alt={"Team 2"} />
                    </div>
                </div>
            </div>
            <div className="w-1/5 pr-5">
                <div className={`w-full text-center ${(match.live === 3) ? 'bg-blue-500' : 'bg-red-600'} py-2 px-7 rounded-2xl hover:bg-gray-100 active:bg-red-600`}>
                    <Link to={'/score-board'} state={{match: match, individual: 0}} className="w-full">{(match.live === 3) ? 'View' : 'Start'}</Link>
                </div>
            </div>
        </div>
    </div>
}

export default MatchContainer;
