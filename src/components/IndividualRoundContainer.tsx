import React from "react";
import {Link} from "react-router-dom";
import {img} from "../pages/HomePage";
import {APITeamProps} from "../pages/Teams";

interface IndividualContainerProps {
    team: APITeamProps
}

const IndividualRoundContainer: React.FC<IndividualContainerProps> = ({team}) => {
    return <div className="bg-[#303030] flex items-center text-center justify-between ">
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

export default IndividualRoundContainer;
