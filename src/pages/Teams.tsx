import React, {useEffect, useState} from "react";
import team1 from '../assests/logo royal.png';
import team2 from '../assests/logo skis.png';
import team3 from '../assests/logo HUTECH.png';
import team4 from '../assests/logo CIS.png';
import {API, graphqlOperation} from "aws-amplify";
import {createTeam, queryTeams, queryAllTeams} from "../graphql/mutation/TeamCRUD";
import {GraphQLResult} from "@aws-amplify/api";

interface TeamProps {
    name: string,
    logo: string
}

interface TeamListProps {
    team: TeamProps,
    idx: number
}

export interface APITeamProps {
    board: string,
    brand: number
    draw: number,
    lose: number,
    score: number
    team: string
    team_id: string
    win: number
}

interface TeamInfoRowProps {
    team: APITeamProps
}

const Teams = () => {
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedBrandIdx, setSelectedBrandIdx] = useState(1);
    const [isSelectingBrand, setIsSelectingBrand] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [teamList, setTeamList] = useState<APITeamProps[]>([]);

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

    useEffect(() => {
        const fetch = async () => {
            try {
                const response = await API.graphql(graphqlOperation(queryTeams)) as GraphQLResult<any>;
                const teamsTemp = response.data?.listMegatonCompetitionTeams.items;
                teamsTemp.sort((a: APITeamProps, b: APITeamProps) => parseInt(a.team_id, 10) - parseInt(b.team_id, 10));
                setTeamList(teamsTemp);

            }catch (err) {
                console.log(err);
                console.error("Error in api")
            }
        }
        fetch();
    }, [])

    const BrandRender: React.FC<TeamListProps> = ({team, idx}) => {
        return <div className="py-2 px-4 hover:bg-[#222222] w-full">
            <button onClick={() => {
                setSelectedBrand(team.name);
                setIsSelectingBrand(false);
                setSelectedBrandIdx(idx + 1);
            }}>{team.name}</button>
        </div>
    }

    const onSubmitTeam = async () => {
        const maxId = teamList.reduce((max, team) => {
            return Number(team.team_id) > max ? Number(team.team_id) : max;
        }, 0);

        console.log(maxId);

        if ((teamName.length !== 0) && (selectedBrand.length !== 0)) {
            const tempList = [...teamList];
            console.log("MAX " + maxId);
            const response = await API.graphql(graphqlOperation(createTeam(`${maxId + 1}`, teamName, selectedBrandIdx))) as GraphQLResult<any>;
            console.log(response);
            tempList.push({
                "team_id": `${maxId + 1}`,
                "team": teamName,
                "win": 1,
                "draw": 1,
                "lose": 1,
                "board": "",
                "score": 1,
                "brand": selectedBrandIdx
            })
            setTeamName('');
            setSelectedBrand('');
            setTeamList(tempList);
        }
    }

    const RowBuilder: React.FC<TeamInfoRowProps> = ({team}) => {
        return <tr className="border-b transition duration-300 ease-in-out text-2xl text-white font-bold">
            <td className="whitespace-nowrap px-6 py-4 font-medium">{team.team_id}</td>
            <td className="whitespace-nowrap px-6 py-4">{team.team}</td>
            <td className="whitespace-nowrap px-6 py-4">
                <div className="w-14">
                    <img src={brandArr[team.brand - 1].logo}/>
                </div>
            </td>

        </tr>
    }


    return <div className={`mt-5`}>
    {/* Team Registration Form   */}
        <div>
            <div className="flex  ml-8 items-center justify-start">
                <div className="w-full flex flex-col gap-6">
                    <div className="text-white text-3xl font-bold">
                        <label>Tên Đội</label>
                    </div>
                    <div className="bg-[#303030] border-4 border-[#222222]  w-3/5 rounded-2xl">
                        <input onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setTeamName(e.target.value);
                        }} value={teamName} className="bg-transparent text-xl text-white w-full h-full py-2 px-4" type={"text"} style={{outline: 'none'}} />
                    </div>
                </div>
                <div className="w-full flex flex-col gap-6">
                    <div className="text-white text-3xl font-bold">
                        <label>Đơn vị dự thi</label>
                    </div>
                    <div className="relative bg-[#303030] border-4 border-[#222222] w-3/5 rounded-2xl">
                        <input onClick={() => {
                            setIsSelectingBrand(true);
                        }}  readOnly={true} value={selectedBrand} className="bg-transparent text-xl text-white w-full h-full py-2 px-4" type={"text"} style={{outline: 'none'}} />
                        {isSelectingBrand ? <div  className="absolute text-white bg-[#222222] text-xl top-14 flex flex-col gap-4 w-full border-4 border-[#222222] rounded-xl">
                            {brandArr.map((brand, idx) => <BrandRender idx={idx} key={idx} team={brand}/>)}
                        </div> : null}
                    </div>
                </div>
            </div>
            <div className="mt-5 ml-8 ">
                <div className="w-fit bg-blue-500 rounded-xl hover:bg-blue-50 active:bg-blue-500">
                    <button onClick={onSubmitTeam} className={`px-8 py-1`}>Thêm đội</button>
                </div>
            </div>
            <div>
                <div className="flex flex-col">
                    <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                            <div className="overflow-hidden">
                                <table className="min-w-full text-left text-3xl text-white">
                                    <thead className="border-b font-medium dark:border-neutral-500">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">#</th>
                                        <th scope="col" className="px-6 py-4">Đội Thi</th>
                                        <th scope="col" className="px-6 py-4">Đơn Vị Dự Thi</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {teamList.map((team, idx) => <RowBuilder team={team} key={idx}/>)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
}

export default Teams;
