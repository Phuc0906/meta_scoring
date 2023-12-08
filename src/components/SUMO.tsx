import React, {useEffect, useState} from "react";
import MatchContainer, {MatchProps} from "./MatchContainer";
import {img} from "../pages/HomePage";
import {API, graphqlOperation} from "aws-amplify";
import {getAllMatches} from "../graphql/mutation/MatchCRUD";
import {GraphQLResult} from "@aws-amplify/api";

type SUMOProps = {
    category: string
}

const SUMO = ({category}: SUMOProps) => {
    const [matches, setMatches] = useState<MatchProps[]>([]);
    const [isView, setIsView] = useState(false);

    useEffect(() => {

        const fetchTeams = async () => {

            const response = await API.graphql(graphqlOperation(getAllMatches(category))) as GraphQLResult<any>;
            setMatches(response.data.listMegatonMatches.items);

        }
        fetchTeams().then(r => console.log(r));
    }, [])

    return <div className=" w-full mt-10 rounded-xl">
        <div className={`bg-[#222222] mx-0 lg:mx-10  py-5 rounded-xl`}>
            <div className=" px-10 flex items-center justify-between">
                <div className="text-xl lg:text-3xl text-white  ">
                    <label>SUMO {category}</label>
                </div>
                <div onClick={() => {
                    setIsView(!isView);
                }}>
                    {isView ? <div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div> : <div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                    </div>}
                </div>
            </div>
            <div className={`flex flex-col gap-3 w-full ${isView ? '' : 'hidden'}`}>
                {matches.map((match, index) => <MatchContainer key={index} match={match} teamImg={img}/>)}
            </div>
        </div>
    </div>
}

export default SUMO;
