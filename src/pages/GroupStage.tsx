import React, {useEffect, useState} from "react";
import {API, graphqlOperation} from "aws-amplify";
import {queryTeams, updateTeamBoard} from "../graphql/mutation/TeamCRUD";
import {createMatch} from "../graphql/mutation/MatchCRUD";
import {GraphQLResult} from "@aws-amplify/api";
import {APITeamProps} from "./Teams";
import team1 from "../assests/logo royal.png";
import team2 from "../assests/logo skis.png";
import team3 from "../assests/logo HUTECH.png";
import team4 from "../assests/logo CIS.png";

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
    const [teamList, setTeamList] = useState<APITeamProps[]>([]);
    const [boardArr, setBoardArr] = useState<string[]>([]);
    const [groups, setGroups] = useState<APITeamProps[][]>([])

    useEffect(() => {
        const fetch = async () => {
            try {
                const response = await API.graphql(graphqlOperation(queryTeams)) as GraphQLResult<any>;
                const teamsTemp = response.data?.listMetaScoringCompetitions.items;
                teamsTemp.sort((a: APITeamProps, b: APITeamProps) => parseInt(a.team_id, 10) - parseInt(b.team_id, 10));
                setTeamList(teamsTemp)
                setGroups(groupByGroup(teamsTemp));
                console.log(response.data?.listMetaScoringCompetitions.items);
            }catch (err) {
                console.error("Error in api")
            }
        }
        fetch();
    }, [])


    useEffect(() => {
        let alphabetArray = [];
        for (let i = 65; i <= 90; i++) {
            alphabetArray.push(String.fromCharCode(i));
        }
        setBoardArr(alphabetArray);


    }, []);

    function groupByGroup(inputArray: APITeamProps[]) {
        const groupedArray = inputArray.reduce((acc, obj) => {
            const group = obj.board;
            // @ts-ignore
            const existingGroup = acc.find(item => item[0].board === group);
            if (existingGroup) {
                // @ts-ignore
                existingGroup.push(obj);
            } else {
                // @ts-ignore
                acc.push([obj]);
            }
            return acc;
        }, []);
        return groupedArray;
    }

    async function generateMatches(groupedArray: APITeamProps[][]) {
        const matches: MatchProps[] = [];
        let match_idx = 1;
        for (let f = 0; f < groupedArray.length; f++) {
            for (let i = 0; i < groupedArray[f].length - 1; i++) {
                for (let j = i + 1; j < groupedArray[f].length; j++) {
                    matches.push({
                        match_id: match_idx.toString(),
                        team1: groupedArray[f][i].team,
                        team2: groupedArray[f][j].team,
                        score1: 1,
                        score2: 1,
                        brand1: groupedArray[f][i].brand,
                        brand2: groupedArray[f][j].brand,
                        live: 1
                    });
                    const response = await API.graphql(graphqlOperation(createMatch(match_idx.toString(), groupedArray[f][i].team, groupedArray[f][j].team, groupedArray[f][i].brand, groupedArray[f][j].brand, groupedArray[f][i].board))) as GraphQLResult<any>;
                    match_idx += 1;
                }
            }
        }
        return matches;
    }

    const onCreateGroupHandle = async () => {
        if ((boardArr.length !== 0) && (teamList.length !==0)) {
            let tracking = 0;
            let alphabetIdx = 0;
            const tempList = [...teamList];
            for (let i = 0; i < teamList.length; i++) {
                if (tracking < 4) {
                    tempList[i].board = boardArr[alphabetIdx];
                    const response = await API.graphql(graphqlOperation(updateTeamBoard(tempList[i].team_id, boardArr[alphabetIdx]))) as GraphQLResult<any>;
                    tracking++;
                }else {
                    i -= 1;
                    tracking = 0;
                    alphabetIdx++;
                }
            }
            console.log(tempList);
            // console.log(generateMatches(groupByGroup(tempList)));
            setGroups(groupByGroup(tempList));
        }
    }

    const onGenerateMatchRequire = () => {
        if (groups.length !== 0) {
            generateMatches(groups);
            alert("Các trận đấu đã được tạo, vui lòng về trang chủ ");
        }else {
            alert("Chưa có bảng đấu")
        }
    }

    useEffect(() => {
        console.log(groups);
    }, [groups])

    return <div className={`mt-5`}>
        <div>
            <div className="ml-10 w-full flex flex-col gap-6">
                <div className="text-white bg-red-600 w-fit text-3xl font-bold rounded-xl">
                    <button onClick={onCreateGroupHandle} className="w-full h-full py-2 px-10">Tạo bảng đấu</button>
                </div>
                <div className="text-white bg-red-600 w-fit text-3xl font-bold rounded-xl">
                    <button onClick={onGenerateMatchRequire} className="w-full h-full py-2 px-10">Tạo trận đấu</button>
                </div>
            </div>
        </div>
        <div className="flex flex-col gap-10 text-white mt-10 w-4/5 mx-auto">
            {groups.map((group, index) => {
                const tempGroup = group;
                tempGroup.sort((a, b) => (((((a.win - 1)*3) + (a.draw - 1)) - (((b.win - 1)*3) + (b.draw - 1))) !== 0 ? ((((a.win - 1)*3) + (a.draw - 1)) - (((b.win - 1)*3) + (b.draw - 1))) : ((a.win - b.win) !== 0) ? (a.win - b.win) : (b.lose - a.lose)) )

                return <div className="  text-2xl font-bold rounded-3xl">
                    <div className="bg-black text-center flex items-center justify-center pt-5 pb-5 rounded-t-3xl">
                        <label>Bảng {group[0].board.toUpperCase()}</label>
                    </div>
                    <div className="bg-[#303030] w-full py-2 px-3 rounded-b-xl pt-2 border-[#171717] border-2">
                        <div className="flex justify-between items-center border-b-2 border-b-gray-400 pb-6">
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
                        <div className="flex flex-col gap-0 ">
                            {tempGroup.map((team, index) =><GroupStageRowBuilder idx={index} team={team} key={index}/>)}
                        </div>
                    </div>
                </div>
            })}
        </div>
        <div>

        </div>
    </div>
}

export default GroupStage;
