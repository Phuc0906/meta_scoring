import React, {useEffect, useState} from "react";
import team1 from '../assests/logo royal.png';
import team2 from '../assests/logo skis.png';
import team3 from '../assests/logo HUTECH.png';
import team4 from '../assests/logo CIS.png';
import {useLocation} from "react-router-dom";
import {MatchProps} from "./HomePage";
import {queryMatches, updateMatchScore, queryMatchById, mutateMatch} from "../graphql/query/Matches";
import {queryBusyTable} from "../graphql/query/Table";
import {registerTable, updateEndMatch, updateGroupStageMatch} from "../graphql/mutation/MatchCRUD";
import {getTeamByName} from "../graphql/mutation/TeamCRUD";
import {API, graphqlOperation} from "aws-amplify";
import {GraphQLResult} from "@aws-amplify/api";
import {getAllMatches} from "../graphql/mutation/MatchCRUD";
import {createTeam} from "../graphql/mutation/TeamCRUD";

const img = [team1, team2, team3, team4];

interface TableSelectionProps {
    table: number
}

interface TeamProps {
    board: string,
    brand: number,
    draw: number,
    lose: number,
    team: string,
    team_id: string,
    win: number,
    semi: number
}



const RefereeBoard = () => {
    const location = useLocation();
    const [onStart, setOnStart] = useState(false);
    const [isSelectingBrand, setIsSelectingBrand] = useState(false);
    const [onMatchEnd, setOnMatchEnd] = useState(false);
    const [selectedTable, setSelectedTable] = useState(1);
    const [availableTable, setAvailableTable] = useState<number[]>([]);
    const [onTableSelect, setOnTableSelect] = useState(false);
    const [team1, setTeam1] = useState<TeamProps>({
        team: "",
        team_id: "",
        win: 1,
        lose: 1,
        draw: 1,
        brand: 1,
        board: "",
        semi: 1
    })
    const [team2, setTeam2] = useState<TeamProps>({
        team: "",
        team_id: "",
        win: 1,
        lose: 1,
        draw: 1,
        brand: 1,
        board: "",
        semi: 1
    })
    const [match, setMatch] = useState<MatchProps>({
        team1: "",
        team2: "",
        live: 1,
        brand1: 0,
        brand2: 0,
        score1: 0,
        score2: 0,
        match_id: '',
        board: "",
        table: 1
    });

    useEffect(() => {
        const fetchTeam = async (team: string, whichTeam: number) => {
            const response = await API.graphql(graphqlOperation(getTeamByName(team))) as GraphQLResult<any>;
            const result = response.data?.listMetaScoringCompetitions.items[0];
            if (whichTeam === 1) {
                setTeam1(result);
            }else {
                setTeam2(result);
            }
        }

        const fetchCurrentTable = async () => {
            if (location.state.match !== null) {
                const response = await API.graphql(graphqlOperation(queryMatchById(location.state.match.match_id))) as GraphQLResult<any>;
                const result = response.data?.listMegatonMatches.items[0];
                console.log(result);

                try {
                    if (result.table !== 1) {
                        setOnTableSelect(true);
                        setSelectedTable(result.table);
                    }

                    if (result.live == 2) {
                        setOnStart(true);
                        setOnTableSelect(true);
                    }else if (result.live == 3) {
                        setOnMatchEnd(true);
                        setOnTableSelect(true);
                    }

                    fetchTeam(result.team1, 1);
                    fetchTeam(result.team2, 2);

                    setMatch({
                        team1: result.team1,
                        team2: result.team2,
                        brand1: result.brand1,
                        brand2: result.brand2,
                        score1: result.score1,
                        score2: result.score2,
                        match_id: result.match_id,
                        live: result.live,
                        board: result.board,
                        table: result.table
                    })
                }catch (err) {
                    console.error(err);
                }

            }
        }
        fetchCurrentTable();
    }, [])

    useEffect(() => {
        console.log(team1);
        console.log(team2);
    }, [team1, team2]);



    useEffect(() => {


        const fetchTable = async () => {
            const response = await API.graphql(graphqlOperation(queryBusyTable)) as GraphQLResult<any>;
            const availableTablesArr = [];
            try {
                const busyTables = response.data?.listMegatonMatches.items;
                for (let i = 1; i < 5; i++) {
                    let selection = i + 1;
                    for (let k = 0; k < busyTables.length; k++) {
                        console.log(busyTables);
                        if (i + 1 === busyTables[k].table) {
                            selection = 1;
                            break;
                        }
                    }
                    if (selection !== 1) {
                        availableTablesArr.push(selection);
                    }


                }
                setAvailableTable(availableTablesArr);
                console.log(availableTablesArr);
            }catch (err) {
                console.log(err)
            }
        }
        fetchTable();
    }, [])

    useEffect(() => {

    }, [match]);

    const TableSelectionRender: React.FC<TableSelectionProps> = ({table}) => {
        return <div className="py-2 px-4 hover:bg-[#222222] w-full">
            <button onClick={() => {
                setSelectedTable(table);
                setIsSelectingBrand(false);
            }}>Sa bàn {table - 1}</button>
        </div>
    }

    const onMatchEndHandle = async () => {
        const response = await API.graphql(graphqlOperation(updateEndMatch(match.match_id))) as GraphQLResult<any>;
        console.log(response);

        try {
            if (match.score1 === match.score2) {
                const drawUpdateTeam1 = await API.graphql(graphqlOperation(updateGroupStageMatch(team1.team_id, team1.draw + 1, team1.lose, team1.win, team1.semi + match.score1))) as GraphQLResult<any>;
                const drawUpdateTeam2 = await API.graphql(graphqlOperation(updateGroupStageMatch(team2.team_id, team2.draw + 1, team2.lose, team2.win, team2.semi + match.score2))) as GraphQLResult<any>;
                console.log(drawUpdateTeam1);
                console.log(drawUpdateTeam2);
            }else if (match.score1 > match.score2 ) {
                const winUpdateTeam1 = await API.graphql(graphqlOperation(updateGroupStageMatch(team1.team_id, team1.draw, team1.lose, team1.win  + 1, team1.semi + match.score1))) as GraphQLResult<any>;
                const winUpdateTeam2 = await API.graphql(graphqlOperation(updateGroupStageMatch(team2.team_id, team2.draw, team2.lose  + 1, team2.win, team2.semi + match.score2))) as GraphQLResult<any>;
                console.log(winUpdateTeam1);
                console.log(winUpdateTeam2);
            }else {
                const winUpdateTeam1 = await API.graphql(graphqlOperation(updateGroupStageMatch(team1.team_id, team1.draw, team1.lose + 1, team1.win, team1.semi + match.score1))) as GraphQLResult<any>;
                const winUpdateTeam2 = await API.graphql(graphqlOperation(updateGroupStageMatch(team2.team_id, team2.draw, team2.lose, team2.win + 1, team2.semi + match.score2))) as GraphQLResult<any>;
                console.log(winUpdateTeam1);
                console.log(winUpdateTeam2);
            }
        }catch (err) {
            console.log(err);
        }
    }


    return <div>
        <div className={` relative`}>
            <div className={`relative w-screen h-screen  mx-auto bg-[#222222] rounded-2xl`}>
                <div className={`w-full text-center text-6xl text-white py-6`}>
                    <label>{match.match_id}</label>
                </div>
                {!onTableSelect ? <div className="w-1/3 mx-auto flex flex-col gap-6">
                    <div className="text-white flex gap-10 items-center text-3xl font-bold">
                        <div>
                            <label>Sa bàn</label>
                        </div>
                        <div className="text-lg bg-blue-500 rounded-xl">
                            <button onClick={async () => {
                                if (selectedTable !== 1) {
                                    setOnTableSelect(true);
                                    const response = await API.graphql(graphqlOperation(registerTable(match.match_id, selectedTable))) as GraphQLResult<any>;
                                }
                            }} className="w-full h-full px-7 py-1">Chọn</button>
                        </div>
                    </div>
                    <div className="relative bg-[#303030] border-4 border-[#222222] w-3/5 rounded-2xl">
                        <input onClick={() => {
                            setIsSelectingBrand(true);
                        }}  readOnly={true} value={(selectedTable !== 1) ? selectedTable - 1 : ''} className="bg-transparent text-xl text-white w-full h-full py-2 px-4" type={"text"} style={{outline: 'none'}} />
                        {isSelectingBrand ? <div  className="absolute text-white bg-[#303030] text-xl top-14 flex flex-col gap-4 w-full border-4 border-[#222222] rounded-xl">
                            {availableTable.map((table, idx) => <TableSelectionRender table={table} key={idx}/>)}
                        </div> : null}
                    </div>
                </div> : null}

                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center justify-start">
                        <div className={`w-96`}>
                            <div className="w-full">
                                <img src={img[match.brand1 - 1]} alt={"Team 1"}/>
                            </div>
                            <div className={`w-full text-center text-white text-5xl`}>
                                <label>{match.team1}</label>
                            </div>
                        </div>
                        {!onMatchEnd ? <div className="flex flex-col gap-10 items-center">
                            <div onClick={() => {

                                const queryCommand = updateMatchScore(match.match_id, match.score1 + 1, match.score2, match.brand1, match.brand2, match.team1, match.team2);
                                API.graphql(graphqlOperation(queryCommand));
                                setMatch(prevState => ({
                                    ...prevState,
                                    score1: match.score1 + 1
                                }))
                            }} className="bg-red-600 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#000000" className="w-12 h-12">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </div>
                            <div onClick={() => {
                                if (match.score1 > 1) {
                                    const queryCommand = updateMatchScore(match.match_id, match.score1 - 1, match.score2, match.brand1, match.brand2, match.team1, match.team2);
                                    API.graphql(graphqlOperation(queryCommand));
                                    setMatch(prevState => ({
                                        ...prevState,
                                        score1: match.score1 - 1
                                    }))
                                }

                            }} className="bg-red-600 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#000000" className="w-12 h-12">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                </svg>
                            </div>
                        </div> : null}
                    </div>

                    <div className={`text-white text-8xl flex items-center justify-between gap-9`}>
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

                    <div className="flex items-center justify-start">
                        {!onMatchEnd ? <div className="flex flex-col gap-10 items-center">
                            <div onClick={() => {
                                const queryCommand = updateMatchScore(match.match_id, match.score1, match.score2 + 1, match.brand1, match.brand2, match.team1, match.team2);
                                const response = API.graphql(graphqlOperation(queryCommand)) as GraphQLResult<any>;
                                setMatch(prevState => ({
                                    ...prevState,
                                    score2: match.score2 + 1
                                }))
                            }} className="bg-red-600 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#000000" className="w-12 h-12">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </div>
                            <div onClick={() => {
                                if (match.score2 > 1) {
                                    const queryCommand = updateMatchScore(match.match_id, match.score1, match.score2 - 1, match.brand1, match.brand2, match.team1, match.team2);
                                    const response = API.graphql(graphqlOperation(queryCommand)) as GraphQLResult<any>;
                                    setMatch(prevState => ({
                                        ...prevState,
                                        score2: match.score2 - 1
                                    }))
                                }
                            }} className="bg-red-600 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#000000" className="w-12 h-12">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                </svg>
                            </div>
                        </div> : null}
                        <div className={`w-96`}>
                            <div className="w-full">
                                <img src={img[match.brand2 - 1]} alt={"Team 1"}/>
                            </div>
                            <div className={`w-full text-center text-white text-5xl`}>
                                <label>{match.team2}</label>
                            </div>
                        </div>

                    </div>
                </div>
                {!onMatchEnd ? <div className="w-full">
                    <div className="w-2/12 mx-auto text-center bg-red-600 rounded-xl text-4xl">
                        <button onClick={async () => {
                            setOnStart(true);
                            if (onStart) {
                                onMatchEndHandle();
                                // const response = await API.graphql(graphqlOperation(mutateMatch(match.match_id, 3))) as GraphQLResult<any>;
                                setOnMatchEnd(true);
                            }else {
                                const response = await API.graphql(graphqlOperation(mutateMatch(match.match_id, 2))) as GraphQLResult<any>;
                            }
                        }} className="w-full px-6 py-2">{onStart ? 'Kết thúc' : 'Bắt đầu'}</button>
                    </div>
                </div> : null}
            </div>

        </div>
    </div>
}

export default RefereeBoard;
