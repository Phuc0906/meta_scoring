import React, {Ref, useEffect, useState} from "react";
import {API, graphqlOperation} from "aws-amplify";
import {updateTeamScore, updateRacingTeamRound1, updateRacingTeamRound2} from "../graphql/mutation/TeamCRUD";
import {GraphQLResult} from "@aws-amplify/api";
import {MicromouseTeamProps} from "./MicromouseScoringContainer";
import {img} from "../pages/HomePage";

type RefereeRacingBoardProps = {
    team: MicromouseTeamProps;
    round: number
}

const RefereeRacingBoard = ({team, round}: RefereeRacingBoardProps) => {
    const [score, setScore] = useState('');
    const [allowEdit, setAllowEdit] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (round === 1) {
            if (team.round1 !== 1) {
                setScore(String(team.round1));
                setAllowEdit(false);
            }
        }else {
            if (team.round2 !== 1) {
                setScore(String(team.round2));
                setAllowEdit(false);
            }
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
                    <label>{team.team} - ROUND {round}</label>
                </div>
                <div className={`w-1/5 mx-auto border-2 border-black mb-12 rounded-xl text-3xl text-white ${((team.round1 !== 1) && (round === 1)) ? 'hidden' : ((team.round2 !== 1) && (round === 2)) ? 'hidden' : ''}`}>
                    <input onChange={(e) => {
                        console.log(e.target.value)
                        setScore(e.target.value);
                    }} value={score} className="w-full h-full bg-transparent px-5 py-2" step="0.01" type={"number"} style={{outline: 'none'}} />
                </div>
                {allowEdit ? <div className="w-full">
                    <div className="w-2/12 mx-auto text-center bg-red-600 rounded-xl text-4xl">
                        {isLoading ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mx-auto animate-spin">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg> : <button onClick={async () => {
                        console.log(score.length)
                        setIsLoading(true);
                        if (score.length !== 0) {
                            if (round === 1) {
                                console.log(updateRacingTeamRound2(team.team_id, score))
                                const response = await API.graphql(graphqlOperation(updateRacingTeamRound1(team.team_id, score))) as GraphQLResult<any>;
                                console.log(response);
                                window.location.reload();
                            }else {

                                const response = await API.graphql(graphqlOperation(updateRacingTeamRound2(team.team_id, score))) as GraphQLResult<any>;
                                console.log(response);
                                window.location.reload();
                            }
                        }else {
                            alert("Wrong score format")
                        }

                        setAllowEdit(false);
                    }} className="w-full px-6 py-2">Lưu Điểm</button>}

                    </div>
                </div> : null}
            </div>
        </div>
    </div>
}

export default RefereeRacingBoard;
