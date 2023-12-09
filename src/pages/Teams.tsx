import React, {useEffect, useState} from "react";
import team1 from '../assests/logo royal.png';
import team2 from '../assests/logo skis.png';
import team3 from '../assests/logo HUTECH.png';
import team4 from '../assests/logo CIS.png';
import team5 from '../assests/VAS.png'
import {API, graphqlOperation} from "aws-amplify";
import {
    createTeam,
    queryTeams,
    createRacingTeam,
    getRacingTeams,
    queryAllRacingTeam
} from "../graphql/mutation/TeamCRUD";
import {GraphQLResult} from "@aws-amplify/api";
import {read, utils} from 'xlsx';

interface TeamProps {
    name: string,
    logo: string
}

interface TeamListProps {
    team: TeamProps,
    idx: number
}

export type RacingTeamProps = {
    team_id: string,
    brand: number,
    team: string,
    round1: number,
    round2: number,
    board: string
}

export interface APITeamProps {
    category: string,
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

type CategoryRenderProps = {
    category: string
}

const Teams = () => {
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedBrandIdx, setSelectedBrandIdx] = useState(1);
    const [isSelectingBrand, setIsSelectingBrand] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [teamList, setTeamList] = useState<APITeamProps[]>([]);
    const [isSelectingCategory, setIsSelectingCategory] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
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

    const competitionCategory = ["DRONE_UNI", "DRONE_REGULAR", "SUMO_UNI", "SUMO_REGULAR", "RACING"]

    useEffect(() => {
        const fetch = async () => {
            try {
                const response = await API.graphql(graphqlOperation(queryTeams)) as GraphQLResult<any>;
                const teamsTemp = response.data?.listMegatonCompetitionTeamTables.items;
                teamsTemp.sort((a: APITeamProps, b: APITeamProps) => parseInt(a.team_id, 10) - parseInt(b.team_id, 10));
                const racingResponse = await API.graphql(graphqlOperation(queryAllRacingTeam)) as GraphQLResult<any>;
                teamsTemp.push(...racingResponse.data?.listRacingTeams.items)
                console.log(teamsTemp);
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

    const CategoryRender = ({category}: CategoryRenderProps) => {
        return <div className="py-2 px-4 hover:bg-[#222222] w-full">
            <button onClick={() => {
                setSelectedCategory(category);
                setIsSelectingCategory(false);
            }}>{category}</button>
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
            if ((selectedCategory === 'RACING') || ((selectedCategory.includes("DRONE")))) {
                const response = await API.graphql(graphqlOperation(createRacingTeam(`${maxId + 1}`, teamName, selectedBrandIdx, selectedCategory))) as GraphQLResult<any>;
                console.log(response);
            }else {
                const response = await API.graphql(graphqlOperation(createTeam(`${maxId + 1}`, teamName, selectedBrandIdx, selectedCategory))) as GraphQLResult<any>;
                console.log(response);
            }
            tempList.push({
                "team_id": `${maxId + 1}`,
                "team": teamName,
                "category": selectedCategory,
                "win": 1,
                "draw": 1,
                "lose": 1,
                "board": selectedCategory,
                "score": 1,
                "brand": selectedBrandIdx
            })
            setTeamName('');
            setSelectedBrand('');
            setSelectedCategory('')
            setTeamList(tempList);
        }
    }

    const onGenerateTeam = async () => {

    }

    const handleFileLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
        // @ts-ignore
        const file = event.target.files[0];

        let maxId = teamList.reduce((max, team) => {
            return Number(team.team_id) > max ? Number(team.team_id) : max;
        }, 0);

        if (file) {
            const reader = new FileReader();

            reader.onload = async (e) => {
                // @ts-ignore
                const data = e.target.result;
                const workbook = read(data, { type: 'binary' });

                // Assuming there is only one sheet in the Excel file
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Convert sheet data to JSON
                const jsonData: string[][] = utils.sheet_to_json(sheet, { header: 1 });

                for (let i = 1; i < jsonData.length; i++) {
                    maxId += 1;
                    console.log(`${jsonData[i][0]} - ${jsonData[i][1]} - ${jsonData[i][2]}`);
                    if ((jsonData[i][2] === 'RACING') || ((jsonData[i][2].includes("DRONE")))) {
                        const response = await API.graphql(graphqlOperation(createRacingTeam(`${maxId}`, jsonData[i][0], parseInt(jsonData[i][1]), jsonData[i][2]))) as GraphQLResult<any>;
                        console.log(response);
                    }else {
                        const response = await API.graphql(graphqlOperation(createTeam(`${maxId}`, jsonData[i][0], parseInt(jsonData[i][1]), jsonData[i][2]))) as GraphQLResult<any>;
                        console.log(response);
                    }
                }

                console.log(jsonData);
            };

            reader.readAsBinaryString(file);
        }

    }

    const RowBuilder: React.FC<TeamInfoRowProps> = ({team}) => {
        useEffect(() => {
            console.log("Setting brand: " + team.brand);
        }, [])

        return <tr className="border-b transition duration-300 ease-in-out text-2xl text-white font-bold">
            <td className="whitespace-nowrap px-6 py-4 font-medium">{team.team_id}</td>
            <td className="whitespace-nowrap px-6 py-4">{team.team}</td>
            <td className="whitespace-nowrap px-6 py-4">
                <div className="w-14">
                    <img src={brandArr[team.brand - 1].logo}/>
                </div>
            </td>
            <td className="whitespace-nowrap px-6 py-4">{(team.board === undefined) ? team.category : team.board}</td>

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
                <div className="w-full flex flex-col gap-6">
                    <div className="text-white text-3xl font-bold">
                        <label>Nội dung thi</label>
                    </div>
                    <div className="relative bg-[#303030] border-4 border-[#222222] w-3/5 rounded-2xl">
                        <input onClick={() => {
                            setIsSelectingCategory(true);
                        }}  readOnly={true} value={selectedCategory} className="bg-transparent text-xl text-white w-full h-full py-2 px-4" type={"text"} style={{outline: 'none'}} />
                        {isSelectingCategory ? <div  className="absolute text-white bg-[#222222] text-xl top-14 flex flex-col gap-4 w-full border-4 border-[#222222] rounded-xl">
                            {competitionCategory.map((category, index) => <CategoryRender category={category} key={index} />)}
                        </div> : null}
                    </div>
                </div>
            </div>
            <div className="mt-5 ml-8 ">
                <div className="w-fit bg-blue-500 rounded-xl hover:bg-blue-50 active:bg-blue-500">
                    <button onClick={onSubmitTeam} className={`px-8 py-1`}>Add Team</button>
                </div>
            </div>
            <div className="mt-5 ml-8 flex items-center justify-start gap-10">
                <div className="w-fit bg-blue-500 rounded-xl hover:bg-blue-50 active:bg-blue-500">
                    <button onClick={onGenerateTeam} className={`px-8 py-1`}>Load Teams From File</button>
                </div>
                <div>
                    <input onChange={handleFileLoad} type={"file"} className="text-yellow-50" />
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
                                        <th scope="col" className="px-6 py-4">Nội dung</th>
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
