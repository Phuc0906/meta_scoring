import React, {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import {MatchProps} from "../pages/HomePage";
import {API, graphqlOperation} from "aws-amplify";
import {createTeam, getTeamByName, updateTeamScore} from "../graphql/mutation/TeamCRUD";
import {GraphQLResult} from "@aws-amplify/api";
import {mutateMatch, queryMatchById, updateMatchScore} from "../graphql/query/Matches";
import {queryBusyTable} from "../graphql/query/Table";
import {
    createMatch,
    getAllMatches, getMatchByBoard,
    registerTable,
    updateEndMatch, updateFinishMatchScore, updateFinishMatchTeam1, updateFinishMatchTeam2,
    updateGroupStageMatch
} from "../graphql/mutation/MatchCRUD";
import team1 from "../assests/logo royal.png";
import team2 from "../assests/logo skis.png";
import team3 from "../assests/logo HUTECH.png";
import team4 from "../assests/logo CIS.png";

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

const RefereeMatchBoard = () => {
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
    const [teamWin, setTeamWin] = useState(0);
    const [onConfirmRequest, setConfirmRequest] = useState(false);

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

    const onFinishClick = async (team1: string, team2: string, whoWin: number) => {
        // Get match current id
        const responseMaxId = await API.graphql(graphqlOperation(getAllMatches)) as GraphQLResult<any>;
        const matchTemp = responseMaxId.data?.listMegatonMatches.items
        let maxId = 0;
        if (matchTemp.length !== 0) {
            matchTemp.sort((a: MatchProps, b: MatchProps) => parseInt(a.match_id, 10) - parseInt(b.match_id, 10));
            console.log("Process")
            maxId = parseInt(matchTemp[matchTemp.length - 1].match_id) + 1;
        }
        let assignBoard = 'quarter_1';
        if (match.board === 'quarter_2' || match.board === 'quarter_1') {
            assignBoard = 'semi_1';
        }else if (match.board === 'quarter_3' || match.board === 'quarter_4') {
            assignBoard = 'semi_2';
        }else if (match.board === 'semi_1' || match.board === 'semi_2') {
            assignBoard = 'final';
        }

        console.log("Process " + assignBoard);

        // Check is match available
        try {
            const responseCheck = await API.graphql(graphqlOperation(getMatchByBoard(assignBoard))) as GraphQLResult<any>;
            if (responseCheck.data?.listMegatonMatches.items.length !== 0) {
                //     Update match
                if (assignBoard !== 'final') {
                    if (team1.length !== 0) {
                        const response = await API.graphql(graphqlOperation(updateFinishMatchTeam2(responseCheck.data?.listMegatonMatches.items[0].match_id, team1, match.brand1))) as GraphQLResult<any>;
                        console.log(response);
                        window.location.reload();
                    }else {
                        const response = await API.graphql(graphqlOperation(updateFinishMatchTeam2(responseCheck.data?.listMegatonMatches.items[0].match_id, team2, match.brand2))) as GraphQLResult<any>;
                        console.log(response);
                        window.location.reload();
                    }
                }else {
                    const responseCheckThird = await API.graphql(graphqlOperation(getMatchByBoard('third'))) as GraphQLResult<any>;
                    let thirdMatchId = responseCheckThird.data?.listMegatonMatches.items[0].match_id
                    if (team1.length !== 0) {
                        const response = await API.graphql(graphqlOperation(updateFinishMatchTeam2(responseCheck.data?.listMegatonMatches.items[0].match_id, team1, match.brand1))) as GraphQLResult<any>;
                        console.log(response);
                        const responseThird = await API.graphql(graphqlOperation(updateFinishMatchTeam2(thirdMatchId, match.team2, match.brand2))) as GraphQLResult<any>;
                        console.log(responseThird);
                        window.location.reload();
                    }else {
                        const response = await API.graphql(graphqlOperation(updateFinishMatchTeam2(responseCheck.data?.listMegatonMatches.items[0].match_id, team2, match.brand2))) as GraphQLResult<any>;
                        console.log(response);
                        const responseThird = await API.graphql(graphqlOperation(updateFinishMatchTeam2(thirdMatchId, match.team1, match.brand1))) as GraphQLResult<any>;
                        console.log(responseThird);
                        window.location.reload();
                    }
                }
            }else {
                if (assignBoard !== 'final') {
                    if (team1.length !== 0) {
                        const response = await API.graphql(graphqlOperation(createMatch(String(maxId), team1, '', match.brand1, 1, assignBoard, 1, 1))) as GraphQLResult<any>;
                        console.log(response);
                        window.location.reload();
                    }else {
                        const response = await API.graphql(graphqlOperation(createMatch(String(maxId), team2, '', match.brand2, 1, assignBoard, 1, 1))) as GraphQLResult<any>;
                        console.log(response);
                        window.location.reload();
                    }
                }else {
                    if (team1.length !== 0) {
                        const response = await API.graphql(graphqlOperation(createMatch(String(maxId), match.team1, '', match.brand1, 1, assignBoard, 1, 1))) as GraphQLResult<any>;
                        console.log(response);
                        const responseThird = await API.graphql(graphqlOperation(createMatch(String(maxId + 1), match.team2, '', match.brand2, 1, 'third', 1, 1))) as GraphQLResult<any>;
                        console.log(responseThird);
                        window.location.reload();
                    }else {
                        const response = await API.graphql(graphqlOperation(createMatch(String(maxId), match.team2, '', match.brand2, 1, assignBoard, 1, 1))) as GraphQLResult<any>;
                        console.log(response);
                        const responseThird = await API.graphql(graphqlOperation(createMatch(String(maxId + 1), match.team1, '', match.brand1, 1, 'third', 1, 1))) as GraphQLResult<any>;
                        console.log(responseThird);
                        window.location.reload();
                    }
                }
            }

        }catch (err) {
            console.log(err);
        }


    }

    const onProcessNextMatch = async () => {
        if (teamWin === 1) {
            const response = await API.graphql(graphqlOperation(updateFinishMatchScore(match.match_id, 2, 1))) as GraphQLResult<any>;
            console.log(response);
            if ((match.board !== 'final') && (match.board !== 'third')) {
                onFinishClick(match.team1, '',  1).then(r => console.log(r));
            }else {
                onFinishClick(match.team1, '', 1).then(r => console.log(r));
            }
        }else {
            const response = await API.graphql(graphqlOperation(updateFinishMatchScore(match.match_id, 1, 2))) as GraphQLResult<any>;
            console.log(response);
            if ((match.board !== 'final') && (match.board !== 'third')) {
                onFinishClick('', match.team2,  2).then(r => console.log(r));
            }else {
                onFinishClick('', match.team2, 2).then(r => console.log(r));
            }
        }
    }

    return <div>
        <div className={` relative`}>
            <div className={`relative w-screen h-screen   mx-auto bg-[#222222] rounded-2xl`}>
                <div className={`w-full text-center text-6xl text-white py-6`}>
                    <label>{match.match_id}</label>
                </div>
                {!onTableSelect ? <div className="w-1/3 mx-auto flex flex-col gap-6 hidden">
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

                <div className="flex w-full  items-center justify-between">
                    <div className="flex items-center justify-start">
                        <div className={`w-3/5 lg:w-96`}>
                            <div className="w-full">
                                <img src={img[match.brand1 - 1]} alt={"Team 1"}/>
                            </div>
                            <div className={`w-full text-center text-white text-xl lg:text-5xl`}>
                                <label>{match.team1}</label>
                            </div>
                            {(match.score1 === match.score2) ? <div className="w-2/3 lg:w-1/2 bg-red-600 mx-auto mt-5 rounded-xl">
                                <button onClick={async () => {
                                    setTeamWin(1);
                                    setConfirmRequest(true);
                                }} className="w-full h-full px-0 lg:px-7 py-2">Về đích</button>
                            </div> : null}
                        </div>
                        {!onMatchEnd ? <div className="flex flex-col gap-10 items-center">
                            <div onClick={() => {

                                const queryCommand = updateMatchScore(match.match_id, match.score1 + 1, match.score2, match.brand1, match.brand2, match.team1, match.team2);
                                API.graphql(graphqlOperation(queryCommand));
                                setMatch(prevState => ({
                                    ...prevState,
                                    score1: match.score1 + 1
                                }))
                            }} className="bg-red-600 p-2 rounded-full hidden">
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

                            }} className="bg-red-600 p-2 rounded-full hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#000000" className="w-12 h-12">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                </svg>
                            </div>
                        </div> : null}
                    </div>

                    <div className={`text-white text-8xl flex items-center justify-between gap-9 `}>
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
                            }} className="bg-red-600 p-2 rounded-full hidden">
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
                            }} className="bg-red-600 p-2 rounded-full hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#000000" className="w-12 h-12">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                </svg>
                            </div>
                        </div> : null}
                        <div className={`w-3/5 lg:w-96`}>
                            <div className="w-full">
                                <img src={img[match.brand2 - 1]} alt={"Team 1"}/>
                            </div>
                            <div className={`w-full text-center text-white text-xl lg:text-5xl`}>
                                <label>{match.team2}</label>
                            </div>
                            {(match.score1 === match.score2) ? <div className="w-2/3 lg:w-1/2 bg-red-600 mx-auto mt-5 rounded-xl">
                                <button onClick={async () => {
                                    setTeamWin(2);
                                    setConfirmRequest(true);

                                }} className="w-full h-full px-7 py-2">Về đích</button>
                            </div> : null}
                        </div>

                    </div>
                </div>
                {!onMatchEnd ? <div className="w-full hidden">
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
            <div className={`absolute   w-screen h-screen transition-all duration-500 pt-[100px] ${onConfirmRequest ? 'top-0' : '-top-[1500px]'}`}>
                <div className="w-1/2 mx-auto my-auto bg-gray-200 py-14">
                    <div className="w-full text-center text-5xl font-bold">
                        <label>Xác nhận kết quả</label>
                    </div>
                    <div className="flex items-center justify-between mx-16 mt-20 ">
                        <div className="bg-blue-200 rounded-xl hover:bg-gray-50 active:bg-gray-400">
                            <button onClick={() => {
                                setConfirmRequest(false);

                            }} className="w-full h-full px-9 py-2 rounded-xl">Cancel</button>
                        </div>
                        <div className="bg-red-200 rounded-xl hover:bg-gray-50 active:bg-gray-400">
                            <button onClick={async () => {
                                await onProcessNextMatch();


                            }} className="w-full h-full px-9 py-2 rounded-xl">Xác nhận</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default RefereeMatchBoard;
