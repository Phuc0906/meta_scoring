import {APITeamProps} from "../pages/Teams";
import {API, graphqlOperation} from "aws-amplify";
import {checkMatchExist, createMatch, getAllMatches, getAllSUMOMatches} from "../graphql/mutation/MatchCRUD";
import {GraphQLResult} from "@aws-amplify/api";
import {MatchProps} from "../components/MatchContainer";

export function groupByGroup(inputArray: APITeamProps[]) {
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

export async function getMatchMaxId() {
    const response = await API.graphql(graphqlOperation(getAllSUMOMatches)) as GraphQLResult<any>;
    const matchTemp = response.data?.listMegatonMatches.items;
    let maxId = 0;
    for (let i = 0; i < matchTemp.length; i++) {
        if (parseInt(matchTemp[i].match_id) > maxId) {
            maxId = parseInt(matchTemp[i].match_id)
        }
    }

    return maxId;
}

export async function checkMatchExitByCategory(match: string) {
    const response = await API.graphql(graphqlOperation(checkMatchExist(match))) as GraphQLResult<any>;
    const matchTemp: MatchProps[] = response.data?.listMegatonMatches.items;

    return matchTemp
}

export async function generateGroupMatch(groupArray: APITeamProps[]) {
    console.log("Start Generating Match");
    const matches: MatchProps[] = [];
    let lastMatchId = await getMatchMaxId();
    console.log("Getting " + lastMatchId);
    let match_idx = lastMatchId + 1;
    for (let i = 0; i < groupArray.length - 1; i++) {
        for (let j = i + 1; j < groupArray.length; j++) {
            const response = await API.graphql(graphqlOperation(createMatch(match_idx.toString(), groupArray[i].team, groupArray[j].team, groupArray[i].brand, groupArray[j].brand, `GROUP_${groupArray[i].board}`, 1, 1))) as GraphQLResult<any>;
            match_idx += 1;
        }
    }

    console.log("Done Generating Match")
    window.location.reload();

    return matches;
}

export async function generateMatches(groupedArray: APITeamProps[][]) {
    const matches: MatchProps[] = [];
    let match_idx = 1;
    for (let f = 0; f < groupedArray.length; f++) {
        for (let i = 0; i < groupedArray[f].length - 1; i++) {
            for (let j = i + 1; j < groupedArray[f].length; j++) {
                const response = await API.graphql(graphqlOperation(createMatch(match_idx.toString(), groupedArray[f][i].team, groupedArray[f][j].team, groupedArray[f][i].brand, groupedArray[f][j].brand, groupedArray[f][i].board, 1, 1))) as GraphQLResult<any>;
                match_idx += 1;
            }
        }
    }
    return matches;
}
