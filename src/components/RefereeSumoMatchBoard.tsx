import React, {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import {MatchProps} from "./MatchContainer";
import {API, graphqlOperation} from "aws-amplify";
import {getTeamByName} from "../graphql/mutation/TeamCRUD";
import {GraphQLResult} from "@aws-amplify/api";
import {mutateMatch, queryMatchById, updateMatchScore} from "../graphql/query/Matches";
import {queryBusyTable} from "../graphql/query/Table";
import {
    createMatch,queryGroupStageTeams, registerTable,
    updateEndMatch, updateFinishMatchTeam1,
    updateFinishMatchTeam2,
    updateGroupStageMatch
} from "../graphql/mutation/MatchCRUD";
import {TableSelectionProps, TeamProps} from "./RefereeMatchBoard";
import team1 from "../assests/logo royal.png";
import team2 from "../assests/logo skis.png";
import team3 from "../assests/logo HUTECH.png";
import team4 from "../assests/logo CIS.png";
import team5 from '../assests/VAS.png';
import team6 from '../assests/kr_flag.png'
import {APITeamProps} from "../pages/Teams";
import {checkMatchExitByCategory, getMatchMaxId} from "../utils/utils";

const img = [team1, team2, team3, team4, team5, team6];

const RefereeSumoMatchBoard = () => {
    const location = useLocation();
    const [onStart, setOnStart] = useState(false);
    const [isSelectingBrand, setIsSelectingBrand] = useState(false);
    const [onMatchEnd, setOnMatchEnd] = useState(false);
    const [selectedTable, setSelectedTable] = useState(1);
    const [availableTable, setAvailableTable] = useState<number[]>([]);
    const [onTableSelect, setOnTableSelect] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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
    });
    const [score, setScore] = useState('');
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
    const [onConfirmRequest, setConfirmRequest] = useState(false);
    const [matchCategory, setMatchCategory] = useState('');

    const splitCategory = (category: string) => {
        const splitedCat = category.split("_");
        let processedCat = "";
        for (let i = 0; i < splitedCat.length; i++) {
            if (splitedCat[i].includes("SUMO")) {
                processedCat = `${splitedCat[i]}_${splitedCat[i + 1]}`
            }
        }

        return processedCat;
    }

    useEffect(() => {
        const fetchTeam = async (team: string, whichTeam: number) => {
            const response = await API.graphql(graphqlOperation(getTeamByName(team))) as GraphQLResult<any>;
            const result = response.data?.listMegatonCompetitionTeamTables.items[0];
            console.log(result);
            if (whichTeam === 1) {
                setTeam1(result);
            }else {
                setTeam2(result);
            }
        }

        const fetchCurrentTable = async () => {
            if (location.state.match !== null) {
                console.log(location.state.match);
                setMatchCategory(splitCategory(location.state.match.board))
                const response = await API.graphql(graphqlOperation(queryMatchById(location.state.match.match_id))) as GraphQLResult<any>;
                const result = response.data?.listMegatonMatches.items[0];

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

        try {
            console.log("Compute: " + team1.score + " - " + parseFloat(score));
            // @ts-ignore
            console.log(`${team1.score + parseFloat(score)}`);
            let matchTime1 = 0;
            let matchTime2 = 0;
            if (team1.score === 1) {
                matchTime1 = parseFloat(score);
            }else {
                // @ts-ignore
                matchTime1 = team1.score + parseFloat(score);
            }

            if (team2.score === 1) {
                matchTime2 = parseFloat(score);
            }else {
                // @ts-ignore
                matchTime2 = team2.score + parseFloat(score);
            }

            if (match.score1 === match.score2) {
                const drawUpdateTeam1 = await API.graphql(graphqlOperation(updateGroupStageMatch(team1.team_id, team1.draw + 1, team1.lose, team1.win, `${matchTime1}`))) as GraphQLResult<any>;
                const drawUpdateTeam2 = await API.graphql(graphqlOperation(updateGroupStageMatch(team2.team_id, team2.draw + 1, team2.lose, team2.win, `${matchTime2}`))) as GraphQLResult<any>;
            }else if (match.score1 > match.score2 ) {
                const winUpdateTeam1 = await API.graphql(graphqlOperation(updateGroupStageMatch(team1.team_id, team1.draw, team1.lose, team1.win  + 1, `${matchTime1}`))) as GraphQLResult<any>;
                const winUpdateTeam2 = await API.graphql(graphqlOperation(updateGroupStageMatch(team2.team_id, team2.draw, team2.lose  + 1, team2.win, `${matchTime2}`))) as GraphQLResult<any>;
            }else {
                const winUpdateTeam1 = await API.graphql(graphqlOperation(updateGroupStageMatch(team1.team_id, team1.draw, team1.lose + 1, team1.win, `${matchTime1}`))) as GraphQLResult<any>;
                const winUpdateTeam2 = await API.graphql(graphqlOperation(updateGroupStageMatch(team2.team_id, team2.draw, team2.lose, team2.win + 1, `${matchTime2}`))) as GraphQLResult<any>;
            }
            await processKnockOut();
            window.location.reload();
        }catch (err) {
            console.log(err);
        }
    }

    const processKnockOut = async () => {
        let teams: APITeamProps[] = [];
        const response = await API.graphql(graphqlOperation(queryGroupStageTeams(team1.board))) as GraphQLResult<any>;
        teams = response.data.listMegatonCompetitionTeamTables.items;
        let isAvailableForProcess = (teams.length > 0);
        for (let i = 0; i < teams.length; i++) {
            const totalMatch = (teams[i].win - 1) + (teams[i].draw - 1) + (teams[i].lose - 1);
            if (totalMatch !== teams.length - 1) {
                isAvailableForProcess = false;
            }
        }
        if (isAvailableForProcess) {
            let lastMatchId = await getMatchMaxId();
            console.log("Process Group Stage Match");
            teams = sortTeam(teams);
            console.log(teams[0] + " - " + `${matchCategory}_A`)
            if (teams[0].board.includes(`${matchCategory}_A`)) {
                console.log("Processing GROUP A")

                const checkMatch1: MatchProps[] = await checkMatchExitByCategory(`${matchCategory}_quarter_1`);
                const checkMatch2: MatchProps[] = await checkMatchExitByCategory(`${matchCategory}_quarter_3`);
                // TODO: MOVE 1st TO QUART 1
                if (checkMatch1.length === 0) {
                    // TODO: CREATE NEW MATCH
                    const response1 = await API.graphql(graphqlOperation(createMatch(`${lastMatchId + 1}`, teams[0].team, "", teams[0].brand, 1, `${matchCategory}_quarter_1`, 1, 1))) as GraphQLResult<any>;
                }else {
                    // TODO: UPDATE EXIST MATCH
                    const response1 = await API.graphql(graphqlOperation(updateFinishMatchTeam1(checkMatch1[0].match_id, teams[0].team, teams[0].brand))) as GraphQLResult<any>;

                }
                // TODO: MOVE 2nd TO QUARTER 3
                if (checkMatch2.length === 0) {
                    const response2 = await API.graphql(graphqlOperation(createMatch(`${lastMatchId + 2}`, "", teams[1].team, 1, teams[1].brand, `${matchCategory}_quarter_3`, 1, 1))) as GraphQLResult<any>;
                }else {
                    // TODO: UPDATE EXIST MATCH
                    const response1 = await API.graphql(graphqlOperation(updateFinishMatchTeam2(checkMatch2[0].match_id, teams[1].team, teams[1].brand))) as GraphQLResult<any>;
                }

            }else if (teams[0].board.includes(`${matchCategory}_B`)) {
                console.log("Processing GROUP B")

                const checkMatch1: MatchProps[] = await checkMatchExitByCategory(`${matchCategory}_quarter_1`);
                const checkMatch2: MatchProps[] = await checkMatchExitByCategory(`${matchCategory}_quarter_3`);
                // TODO: MOVE 1st TO QUART 1
                if (checkMatch2.length === 0) {
                    // TODO: CREATE NEW MATCH
                    const response1 = await API.graphql(graphqlOperation(createMatch(`${lastMatchId + 1}`, teams[0].team, "", teams[0].brand, 1, `${matchCategory}_quarter_3`, 1, 1))) as GraphQLResult<any>;
                }else {
                    // TODO: UPDATE EXIST MATCH
                    const response1 = await API.graphql(graphqlOperation(updateFinishMatchTeam1(checkMatch2[0].match_id, teams[0].team, teams[0].brand))) as GraphQLResult<any>;
                }
                // TODO: MOVE 2nd TO QUARTER 3
                if (checkMatch1.length === 0) {
                    const response2 = await API.graphql(graphqlOperation(createMatch(`${lastMatchId + 2}`, "", teams[1].team, 1, teams[1].brand, `${matchCategory}_quarter_1`, 1, 1))) as GraphQLResult<any>;
                }else {
                    // TODO: UPDATE EXIST MATCH
                    const response1 = await API.graphql(graphqlOperation(updateFinishMatchTeam2(checkMatch1[0].match_id, teams[1].team, teams[1].brand))) as GraphQLResult<any>;
                }
            }else if (teams[0].board.includes(`${matchCategory}_C`)) {
                console.log("Processing GROUP C")

                const checkMatch1: MatchProps[] = await checkMatchExitByCategory(`${matchCategory}_quarter_2`);
                const checkMatch2: MatchProps[] = await checkMatchExitByCategory(`${matchCategory}_quarter_4`);
                // TODO: MOVE 1st TO QUART 1
                if (checkMatch1.length === 0) {
                    // TODO: CREATE NEW MATCH
                    const response1 = await API.graphql(graphqlOperation(createMatch(`${lastMatchId + 1}`, teams[0].team, "", teams[0].brand, 1, `${matchCategory}_quarter_2`, 1, 1))) as GraphQLResult<any>;
                }else {
                    // TODO: UPDATE EXIST MATCH
                    const response1 = await API.graphql(graphqlOperation(updateFinishMatchTeam1(checkMatch1[0].match_id, teams[0].team, teams[0].brand))) as GraphQLResult<any>;

                }
                // TODO: MOVE 2nd TO QUARTER 3
                if (checkMatch2.length === 0) {
                    const response2 = await API.graphql(graphqlOperation(createMatch(`${lastMatchId + 2}`, "", teams[1].team, 1, teams[1].brand, `${matchCategory}_quarter_4`, 1, 1))) as GraphQLResult<any>;
                }else {
                    // TODO: UPDATE EXIST MATCH
                    const response1 = await API.graphql(graphqlOperation(updateFinishMatchTeam2(checkMatch2[0].match_id, teams[1].team, teams[1].brand))) as GraphQLResult<any>;
                }
            }else if (teams[0].board.includes(`${matchCategory}_D`)) {
                console.log("Processing GROUP D")

                const checkMatch1: MatchProps[] = await checkMatchExitByCategory(`${matchCategory}_quarter_2`);
                const checkMatch2: MatchProps[] = await checkMatchExitByCategory(`${matchCategory}_quarter_4`);
                // TODO: MOVE 1st TO QUART 1
                if (checkMatch2.length === 0) {
                    // TODO: CREATE NEW MATCH
                    const response1 = await API.graphql(graphqlOperation(createMatch(`${lastMatchId + 1}`, teams[0].team, "", teams[0].brand, 1, `${matchCategory}_quarter_4`, 1, 1))) as GraphQLResult<any>;
                }else {
                    // TODO: UPDATE EXIST MATCH
                    const response1 = await API.graphql(graphqlOperation(updateFinishMatchTeam1(checkMatch2[0].match_id, teams[0].team, teams[0].brand))) as GraphQLResult<any>;
                }
                // TODO: MOVE 2nd TO QUARTER 3
                if (checkMatch1.length === 0) {
                    const response2 = await API.graphql(graphqlOperation(createMatch(`${lastMatchId + 2}`, "", teams[1].team, 1, teams[1].brand, `${matchCategory}_quarter_2`, 1, 1))) as GraphQLResult<any>;
                }else {
                    // TODO: UPDATE EXIST MATCH
                    const response1 = await API.graphql(graphqlOperation(updateFinishMatchTeam2(checkMatch1[0].match_id, teams[1].team, teams[1].brand))) as GraphQLResult<any>;
                }
            }

        }else {
            console.log("Continue for Group Stage");
        }
    }

    const sortTeam = (group: APITeamProps[]) => {
        let processGroup: APITeamProps[] = group;
        for (let i = 0; i < processGroup.length; i++) {
            const rootTeamScore = (processGroup[i].win - 1) * 3 + (processGroup[i].draw - 1);
            for (let k = 0; k < processGroup.length; k++) {
                const comparedTeam = (processGroup[k].win - 1) * 3 + (processGroup[k].draw - 1);
                if (rootTeamScore > comparedTeam) {
                    const tmp = processGroup[i];
                    processGroup[i] = processGroup[k];
                    processGroup[k] = tmp;

                }else if (rootTeamScore === comparedTeam) {
                    if (processGroup[k].score > processGroup[i].score) {
                        const tmp = processGroup[i];
                        processGroup[i] = processGroup[k];
                        processGroup[k] = tmp;
                    }
                }
            }
        }

        for (let i = 0; i < processGroup.length; i++) {
            const rootTeamScore = (processGroup[i].win - 1) * 3 + (processGroup[i].draw - 1);
            for (let k = 0; k < processGroup.length; k++) {
                const comparedTeam = (processGroup[k].win - 1) * 3 + (processGroup[k].draw - 1);
                if (rootTeamScore > comparedTeam) {
                    const tmp = processGroup[i];
                    processGroup[i] = processGroup[k];
                    processGroup[k] = tmp;

                }else if (rootTeamScore === comparedTeam) {
                    if (processGroup[k].score > processGroup[i].score) {
                        const tmp = processGroup[i];
                        processGroup[i] = processGroup[k];
                        processGroup[k] = tmp;
                    }
                }
            }
        }

        return processGroup;
    }

    const processNextKnockOut = async (board: string, category: string, teamWin: string, teamBrand: number, whichTeam: number) => {
        const response = await API.graphql(graphqlOperation(updateEndMatch(match.match_id))) as GraphQLResult<any>;
        let assignBoard = 'semi_1';
        let lastMatchId = await getMatchMaxId();
        console.log(`Process ${lastMatchId + 1} - ${category} - ${teamWin} - ${teamBrand}`)
        try {
            if (board.includes("quarter_1")) {
                assignBoard = `${category}_semi_1`;
                const checkMatch1: MatchProps[] = await checkMatchExitByCategory(assignBoard);
                if (checkMatch1.length === 0) {
                    //TODO: CREATE NEXT KNOCK OUT MATCH
                    const response1 = await API.graphql(graphqlOperation(createMatch(`${lastMatchId + 1}`, teamWin, "", teamBrand, 1, assignBoard, 1, 1))) as GraphQLResult<any>;
                }else {
                    // TODO: UPDATE EXIST MATCH
                    const response1 = await API.graphql(graphqlOperation(updateFinishMatchTeam1(checkMatch1[0].match_id, teamWin, teamBrand))) as GraphQLResult<any>;
                }
            }else if (board.includes("quarter_2")) {
                assignBoard = `${category}_semi_1`;
                const checkMatch1: MatchProps[] = await checkMatchExitByCategory(assignBoard);
                if (checkMatch1.length === 0) {
                    //TODO: CREATE NEXT KNOCK OUT MATCH
                    const response1 = await API.graphql(graphqlOperation(createMatch(`${lastMatchId + 1}`, "", teamWin, 1, teamBrand, assignBoard, 1, 1))) as GraphQLResult<any>;
                } else {
                    // TODO: UPDATE EXIST MATCH
                    const response1 = await API.graphql(graphqlOperation(updateFinishMatchTeam2(checkMatch1[0].match_id, teamWin, teamBrand))) as GraphQLResult<any>;
                }
            }else if (board.includes("quarter_3")) {
                assignBoard = `${category}_semi_2`;
                const checkMatch1: MatchProps[] = await checkMatchExitByCategory(assignBoard);
                if (checkMatch1.length === 0) {
                    //TODO: CREATE NEXT KNOCK OUT MATCH
                    const response1 = await API.graphql(graphqlOperation(createMatch(`${lastMatchId + 1}`, teamWin, "", teamBrand, 1, assignBoard, 1, 1))) as GraphQLResult<any>;
                } else {
                    // TODO: UPDATE EXIST MATCH
                    const response1 = await API.graphql(graphqlOperation(updateFinishMatchTeam1(checkMatch1[0].match_id, teamWin, teamBrand))) as GraphQLResult<any>;
                }
            }else if (board.includes("quarter_4")) {

                assignBoard = `${category}_semi_2`;

                const checkMatch1: MatchProps[] = await checkMatchExitByCategory(assignBoard);
                console.log("Process in quarter 4 ")
                console.log(checkMatch1);

                if (checkMatch1.length === 0) {
                    //TODO: CREATE NEXT KNOCK OUT MATCH
                    const response1 = await API.graphql(graphqlOperation(createMatch(`${lastMatchId + 1}`, "", teamWin, 1, teamBrand, assignBoard, 1, 1))) as GraphQLResult<any>;
                } else {
                    // TODO: UPDATE EXIST MATCH
                    console.log("Update current Match")
                    const response1 = await API.graphql(graphqlOperation(updateFinishMatchTeam2(checkMatch1[0].match_id, teamWin, teamBrand))) as GraphQLResult<any>;
                }
            }else if (board.includes("semi_1")) {
                assignBoard = `${category}_final`;
                const assignThirdBoard = `${category}_third`;
                const checkMatch1: MatchProps[] = await checkMatchExitByCategory(assignBoard);
                const checkMatch2: MatchProps[] = await checkMatchExitByCategory(assignThirdBoard);
                let loseTeam = teamWin;
                let loseBrand = teamBrand;
                if (whichTeam === 1) {
                    loseTeam = match.team2;
                    loseBrand = match.brand2
                }else {
                    loseTeam = match.team1;
                    loseBrand = match.brand1
                }

                if (checkMatch1.length === 0) {
                    //TODO: CREATE NEXT KNOCK OUT MATCH
                    const response1 = await API.graphql(graphqlOperation(createMatch(`${lastMatchId + 1}`, teamWin, "", teamBrand, 1, assignBoard, 1, 1))) as GraphQLResult<any>;
                } else {
                    // TODO: UPDATE EXIST MATCH
                    console.log("Update current Match")
                    const response1 = await API.graphql(graphqlOperation(updateFinishMatchTeam1(checkMatch1[0].match_id, teamWin, teamBrand))) as GraphQLResult<any>;
                }

                if (checkMatch2.length === 0) {
                    //TODO: CREATE NEXT KNOCK OUT MATCH
                    const response1 = await API.graphql(graphqlOperation(createMatch(`${lastMatchId + 2}`, "", loseTeam, 1, loseBrand, assignThirdBoard, 1, 1))) as GraphQLResult<any>;
                } else {
                    // TODO: UPDATE EXIST MATCH
                    console.log("Update current Match")
                    const response1 = await API.graphql(graphqlOperation(updateFinishMatchTeam2(checkMatch2[0].match_id, loseTeam, loseBrand))) as GraphQLResult<any>;
                }


            }else if (board.includes("semi_2")) {
                assignBoard = `${category}_final`;
                const assignThirdBoard = `${category}_third`;
                const checkMatch1: MatchProps[] = await checkMatchExitByCategory(assignBoard);
                const checkMatch2: MatchProps[] = await checkMatchExitByCategory(assignThirdBoard);
                let loseTeam = teamWin;
                let loseBrand = teamBrand;
                if (whichTeam === 1) {
                    loseTeam = match.team2;
                    loseBrand = match.brand2
                }else {
                    loseTeam = match.team1;
                    loseBrand = match.brand1
                }

                if (checkMatch1.length === 0) {
                    //TODO: CREATE NEXT KNOCK OUT MATCH
                    const response1 = await API.graphql(graphqlOperation(createMatch(`${lastMatchId + 1}`, "", teamWin, 1, teamBrand, assignBoard, 1, 1))) as GraphQLResult<any>;
                } else {
                    // TODO: UPDATE EXIST MATCH
                    console.log("Update current Match")
                    const response1 = await API.graphql(graphqlOperation(updateFinishMatchTeam2(checkMatch1[0].match_id, teamWin, teamBrand))) as GraphQLResult<any>;
                }

                if (checkMatch2.length === 0) {
                    //TODO: CREATE NEXT KNOCK OUT MATCH
                    const response1 = await API.graphql(graphqlOperation(createMatch(`${lastMatchId + 2}`, loseTeam, "", loseBrand, 1, assignThirdBoard, 1, 1))) as GraphQLResult<any>;
                } else {
                    // TODO: UPDATE EXIST MATCH
                    console.log("Update current Match")
                    const response1 = await API.graphql(graphqlOperation(updateFinishMatchTeam1(checkMatch2[0].match_id, loseTeam, loseBrand))) as GraphQLResult<any>;
                }


            }
        }catch (err) {
            console.log(err)
        }
    }

    const onProcessNextMatch = async () => {
        // const response = await API.graphql(graphqlOperation(updateFinishMatchScore(match.match_id, match.score1, match.score2))) as GraphQLResult<any>;
        if (match.score1 > match.score2) {
            await processNextKnockOut(match.board, matchCategory, match.team1, match.brand1, 1);
        }else {
            await processNextKnockOut(match.board, matchCategory, match.team2, match.brand2, 2);
        }
        window.location.reload();

    }

    return <div>
        <div className={` relative`}>
            <div className={`relative w-screen h-screen   mx-auto bg-[#222222] rounded-2xl`}>
                <div className={`w-full text-center text-6xl text-white py-6`}>
                    <label>{team1.board}</label>
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
                        <div className="w-32 lg:w-96 flex flex-col items-center">
                            <div className="w-2/3">
                                <img src={img[match.brand1 - 1]} alt={"Team 1"}/>
                            </div>
                            <div className="w-full text-center text-white text-lg lg:text-3xl">
                                <label>{match.team1}</label>
                            </div>
                        </div>
                        {!onMatchEnd ? <div className="flex flex-col gap-10 items-center">
                            <div onClick={() => {
                                const queryCommand = updateMatchScore(match.match_id, match.score1 + 1, match.score2, match.brand1, match.brand2, match.team1, match.team2);
                                API.graphql(graphqlOperation(queryCommand));
                                setMatch((prevState: MatchProps) => ({
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
                                    setMatch((prevState: MatchProps) => ({
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
                                setMatch((prevState: MatchProps) => ({
                                    ...prevState,
                                    score2: match.score2 + 1
                                }))
                            }} className="bg-red-600 p-2 rounded-full ">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#000000" className="w-12 h-12">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </div>
                            <div onClick={() => {
                                if (match.score2 > 1) {
                                    const queryCommand = updateMatchScore(match.match_id, match.score1, match.score2 - 1, match.brand1, match.brand2, match.team1, match.team2);
                                    const response = API.graphql(graphqlOperation(queryCommand)) as GraphQLResult<any>;
                                    setMatch((prevState: MatchProps) => ({
                                        ...prevState,
                                        score2: match.score2 - 1
                                    }))
                                }
                            }} className="bg-red-600 p-2 rounded-full ">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#000000" className="w-12 h-12">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                </svg>
                            </div>
                        </div> : null}
                        <div className="w-32 lg:w-96 flex flex-col items-center">
                            <div className="w-2/3">
                                <img src={img[match.brand2 - 1]} alt={"Team 1"}/>
                            </div>
                            <div className="w-full text-center text-white text-lg lg:text-3xl">
                                <label>{match.team2}</label>
                            </div>
                        </div>

                    </div>
                </div>
                {onStart ? <div className="w-1/5 mx-auto border-2 border-black mb-12 rounded-xl text-xl text-white">
                    <input onChange={(e) => {
                        setScore(e.target.value);
                    }} value={score} placeholder={"Time Completion"} className="w-full h-full bg-transparent px-5 py-2" type={"number"} style={{outline: 'none'}} />
                </div> : null}
                {!onMatchEnd ? <div className="w-full ">
                    <div className="w-2/12 mx-auto text-center bg-red-600 rounded-xl text-4xl">
                        <button onClick={async () => {
                            if ((onStart) && (score.length > 0)) {
                                setOnStart(true);
                            }

                            if (!onStart) {
                                setOnStart(true);
                            }

                            if (onStart) {
                                if (score.length > 0) {

                                    // const response = await API.graphql(graphqlOperation(mutateMatch(match.match_id, 3))) as GraphQLResult<any>;
                                    setConfirmRequest(true);
                                }else {
                                    alert("Please Enter Time Completion")
                                }

                            //     TODO: Process Winner
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

                            {!isLoading ? <button onClick={async () => {
                                setIsLoading(true);
                                if (match.board.includes("GROUP")) {
                                    await onMatchEndHandle();
                                }else {
                                    await onProcessNextMatch();
                                }
                            }} className="w-full h-full px-9 py-2 rounded-xl">Xác nhận</button> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mx-auto animate-spin">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
export default RefereeSumoMatchBoard;
