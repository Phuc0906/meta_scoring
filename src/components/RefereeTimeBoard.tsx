import React, {useEffect, useState} from "react";
import team1 from "../assests/logo royal.png";
import team2 from "../assests/logo skis.png";
import team3 from "../assests/logo HUTECH.png";
import team4 from "../assests/logo CIS.png";
import {APITeamProps} from "../pages/Teams";
import {createTeam, updateTeamScore} from "../graphql/mutation/TeamCRUD";
import {API, graphqlOperation} from "aws-amplify";
import {GraphQLResult} from "@aws-amplify/api";


const img = [team1, team2, team3, team4];

interface TimeBoardProps {
    team: APITeamProps
}

const RefereeTimeBoard: React.FC<TimeBoardProps> = ({team}) => {
    const [score, setScore] = useState('');
    const [allowEdit, setAllowEdit] = useState(true);

    useEffect(() => {
        if (team.win === 2) {
            setScore(String(team.score));
            setAllowEdit(false);
        }
    }, [])

    return <div>
        <div className={` relative`}>
            <div className={`relative w-screen h-screen  mx-auto bg-[#222222] rounded-2xl`}>
                <div className={`w-full text-center text-6xl text-white py-6`}>
                    <label>{team.team_id}</label>
                </div>
                <div className="w-full">
                    <div className="w-56 mx-auto">
                        <img src={img[team.brand - 1]}/>
                    </div>
                </div>
                <div className="text-4xl text-white w-full text-center mb-10">
                    <label>{team.team}</label>
                </div>
                <div className="w-1/5 mx-auto border-2 border-black mb-12 rounded-xl text-3xl text-white">
                    <input onChange={(e) => {
                        setScore(e.target.value);
                    }} value={score} className="w-full h-full bg-transparent px-5 py-2" type={"number"} style={{outline: 'none'}} />
                </div>
                {allowEdit ? <div className="w-full">
                    <div className="w-2/12 mx-auto text-center bg-red-600 rounded-xl text-4xl">
                        <button onClick={async () => {
                            const response = await API.graphql(graphqlOperation(updateTeamScore(team.team_id, score))) as GraphQLResult<any>;
                            console.log(response);
                            setAllowEdit(false);
                        }} className="w-full px-6 py-2">Lưu Điểm</button>
                    </div>
                </div> : null}
            </div>
        </div>
    </div>
}

export default RefereeTimeBoard;
