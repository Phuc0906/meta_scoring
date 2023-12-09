import React, {useEffect, useState} from "react";
import {API, graphqlOperation} from "aws-amplify";
import {queryTeams, updateTeamBoard} from "../graphql/mutation/TeamCRUD";
import {createMatch, queryMatchByBoard} from "../graphql/mutation/MatchCRUD";
import {GraphQLResult} from "@aws-amplify/api";
import {APITeamProps} from "./Teams";
import team1 from "../assests/logo royal.png";
import team2 from "../assests/logo skis.png";
import team3 from "../assests/logo HUTECH.png";
import team4 from "../assests/logo CIS.png";
import team5 from '../assests/VAS.png'
import {generateGroupMatch, generateMatches, groupByGroup} from "../utils/utils";

const brandArr = [
    {
        name: 'Royal',
        logo: team1
    },
    {
        name: 'SIKS',
        logo: team2
    },
    {
        name: 'Hutech',
        logo: team3
    },
    {
        name: 'CIS',
        logo: team4
    },
    {
        name: 'VAS',
        logo: team5
    }
]

export interface GroupStageRowBuilderProps {
    team: APITeamProps,
    idx: number
}

export interface MatchProps {
    match_id: string,
    team1: string,
    team2: string,
    brand1: number,
    brand2: number,
    score1: number,
    score2: number,
    live: number

}

type CategoryGroupProps = {
    index: number,
    group: APITeamProps[]
}



const GroupByCategory = ({index, group}: CategoryGroupProps) => {
    const [isView, setIsView] = useState(false);
    const [boardArr, setBoardArr] = useState<string[]>([]);
    const isCreateGroupAvailable = (group[0].board.toUpperCase() === 'SUMO_UNI') || (group[0].board.toUpperCase() === 'SUMO_REGULAR')
    const [isAllowCreateMatch, setIsAllowCreateMatch] = useState(false);

    useEffect(() => {

        const initAlphabetArray = () => {
            let alphabetArray = [];
            for (let i = 65; i <= 90; i++) {
                alphabetArray.push(String.fromCharCode(i));
            }
            setBoardArr(alphabetArray);
        }

        const checkMatchIsCreated = async () => {
            const response = await API.graphql(graphqlOperation(queryMatchByBoard(group[0].board.toUpperCase()))) as GraphQLResult<any>;
            if (response.data.listMegatonMatches.items.length === 0) {
                setIsAllowCreateMatch(true);
            }
        }

        initAlphabetArray();
        if (!group[0].board.toUpperCase().includes("DRONE")) {
            checkMatchIsCreated();
        }


    }, []);

    const handleCreateGroup = async () => {
        const shuffled = shuffleArray(group);
        if ((boardArr.length !== 0) && (shuffled.length !==0)) {
            let tracking = 0;
            let alphabetIdx = 0;
            const tempList = [...shuffled];
            for (let i = 0; i < shuffled.length; i++) {
                tempList[i].board += "_" + boardArr[alphabetIdx];
                if ((i + 1) % 7 === 0) {
                    alphabetIdx++;
                }
                const response = await API.graphql(graphqlOperation(updateTeamBoard(tempList[i].team_id, tempList[i].board))) as GraphQLResult<any>;
            }
            console.log(groupByGroup(tempList));
        }
    }

    const handleCreateMatches = async () => {
        await generateGroupMatch(group)
    }

    function shuffleArray(array: APITeamProps[]) {
        const shuffledArr: APITeamProps[] = array;
        for (let i = shuffledArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArr[i], shuffledArr[j]] = [shuffledArr[j], shuffledArr[i]];
        }

        return shuffledArr;
    }

    return <div key={index} className="  text-2xl font-bold rounded-3xl">
        <div className="bg-black text-center flex items-center justify-between px-16 pt-5 pb-5 rounded-t-3xl">
            <div className="invisible">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
            <div>
                <label>BẢNG {group[0].board.toUpperCase()}</label>
                {isCreateGroupAvailable ? <div className="bg-red-500 rounded-xl">
                    <button onClick={handleCreateGroup} className="w-full h-full px-4 py-1 rounded-xl">Tạo Bảng Đấu</button>
                </div> : null}
                {(!isCreateGroupAvailable && isAllowCreateMatch) ? <div className="bg-red-500 rounded-xl">
                    <button onClick={handleCreateMatches} className="w-full h-full px-4 py-1 rounded-xl">Tạo Trận Đấu</button>
                </div> : null}
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
        <div className="bg-[#303030]  w-full py-2 px-3 rounded-b-xl pt-2 border-[#171717] border-2">
            <div className={`flex ${isView ? '' : 'hidden'} justify-between items-center border-b-2 border-b-gray-400 pb-6`}>
                <div className={` text-center text-2xl w-40`}>
                    <label>Đội</label>
                </div>
                <div className={`flex gap-16 mr-10`}>
                    <div className={` text-center  text-2xl w-16`}>
                        <label>Thắng</label>
                    </div>
                    <div className={` text-center text-2xl w-16`}>
                        <label>Hoà</label>
                    </div>
                    <div className={` text-center text-2xl w-16`}>
                        <label>Thua</label>
                    </div>
                    <div className={` text-center text-2xl w-16`}>
                        <label>Điểm</label>
                    </div>
                </div>
            </div>
            <div className={`flex ${isView ? '' : 'hidden'} flex-col gap-0 `}>
                {group.map((team, index) =><GroupStageRowBuilder idx={index} team={team} key={index}/>)}
            </div>
        </div>
    </div>
}

const GroupStageRowBuilder: React.FC<GroupStageRowBuilderProps> = ({team, idx}) => {
    const windowSize = {
        width: 900
    }

    return <div className={`flex py-6 px-2 justify-between items-center mr-10`}>
        <div className={`flex items-center gap-4 w-fit text-center ${windowSize.width > 700 ? 'text-2xl' : 'text-lg'}`}>
            <div className={`${windowSize.width > 700 ? 'w-16' : 'w-8'}`}>
                <img src={brandArr[team.brand - 1].logo} />
            </div>
            <div>
                <label>{team.team}</label>
            </div>
        </div>
        <div className={`flex  ${windowSize.width > 700 ? 'gap-16 ' : 'gap-4'}`}>
            <div className={` text-center ${windowSize.width > 700 ? 'text-2xl w-16' : 'text-lg w-12'}`}>
                <label>{team.win - 1}</label>
            </div>
            <div className={` text-center   ${windowSize.width > 700 ? 'text-2xl w-16' : 'text-lg w-12'}`}>
                <label>{team.draw - 1}</label>
            </div >
            <div className={` text-center   ${windowSize.width > 700 ? 'text-2xl w-16' : 'text-lg w-12'}`}>
                <label>{team.lose - 1}</label>
            </div>
            <div className={` text-center   ${windowSize.width > 700 ? 'text-2xl w-16' : 'text-lg w-12'}`}>
                <label>{(team.win - 1)*3 + (team.draw - 1)}</label>
            </div>
        </div>
    </div>
}

const GroupStage = () => {
    const [groups, setGroups] = useState<APITeamProps[][]>([])

    useEffect(() => {
        const fetch = async () => {
            try {
                const response = await API.graphql(graphqlOperation(queryTeams)) as GraphQLResult<any>;
                const teamsTemp = response.data?.listMegatonCompetitionTeamTables.items;
                teamsTemp.sort((a: APITeamProps, b: APITeamProps) => parseInt(a.team_id, 10) - parseInt(b.team_id, 10));
                setGroups(groupByGroup(teamsTemp));
            }catch (err) {
                console.error("Error in api")
                console.log(err);
            }
        }
        fetch().then(r => console.log(r));
    }, [])


    useEffect(() => {
        console.log(groups);
    }, [groups])

    return <div className={`mt-5`}>
        <div className="flex flex-col gap-10 text-white mt-10 w-4/5 mx-auto">
            {groups.map((group, index) => <GroupByCategory index={index} group={group}/>)}
        </div>
    </div>
}

export default GroupStage;
