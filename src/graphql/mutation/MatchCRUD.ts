import exp from "constants";

export const createMatch = (match_id: string, team1: string, team2: string, brand1: number, brand2: number, board: string, score1: number, score2: number) => {
    return `
mutation MyMutation {
    createMegatonMatch(input: {brand1: ${brand1}, brand2: ${brand2}, live: 1, match_id: "${match_id}", score1: ${score1}, score2: ${score2}, team1: "${team1}", team2: "${team2}", table: 1, board: "${board}"}) {
        team1
        team2
        score1
        score2
        brand1
        brand2
        live
        board
        table
    }
}
`
}

export const getMatchByBoard = (board: string) => {
    return `
    query MyQuery {
      listMegatonMatches(filter: {board: {eq: "${board}"}}) {
        items {
          match_id
        }
      }
    }
    `
}


export const getAllMatches = (board: string) => {
    return `
        query MyQuery {
          listMegatonMatches(filter: {board: {contains: "${board}"}}, limit: 40) {
            items {
              board
              brand1
              brand2
              live
              match_id
              score1
              score2
              table
              team1
              team2
            }
          }
        }
        `
};

export const getAllSUMOMatches = `
        query MyQuery {
          listMegatonMatches(limit: 200) {
            items {
              board
              brand1
              brand2
              live
              match_id
              score1
              score2
              table
              team1
              team2
            }
          }
        }
        `;

export const setMatchLive = (match_id: string) => {
    return `
    mutation MyMutation {
      updateMegatonMatch(input: {match_id: "${match_id}", live: 2})
    }`
}

export const registerTable = (match_id: string, table: number) => {
    return `
    
    mutation MyMutation {
      updateMegatonMatch(input: {match_id: "${match_id}", table: ${table}}) {
        team1
        team2
        score1
        score2
        brand1
        brand2
        live
        board
        table
      }
    }
`
}

export const updateFinishMatchScore = (match_id: string, score1: number, score2: number) => {
    return `
    mutation MyMutation {
      updateMegatonMatch(input: {match_id: "${match_id}", score1: ${score1}, score2: ${score2}}) {
        match_id
      }
    }
    `
}

export const updateFinishMatchTeam1 = (match_id: string, team1: string, brand1: number) => {
    return `
    mutation MyMutation {
      updateMegatonMatch(input: {match_id: "${match_id}", score1: 1, score2: 1, team1: "${team1}", brand1: ${brand1}}) {
        match_id
      }
    }
    `
}

export const updateFinishMatchTeam2 = (match_id: string, team2: string, brand2: number) => {
    return `
    mutation MyMutation {
      updateMegatonMatch(input: {match_id: "${match_id}", score1: 1, score2: 1, team2: "${team2}", brand2: ${brand2}}) {
        match_id
      }
    }
    `
}

export const updateEndMatch = (match_id: string) => {
    return `
    mutation MyMutation {
      updateMegatonMatch(input: {match_id: "${match_id}", live: 3, table: 1}) {
        match_id
        live
        table
      }
    }
    `
}

export const updateGroupStageMatch = (team_id: string, draw: number, lose: number, win: number, score: string) => {
    return `
    mutation MyMutation {
      updateMegatonCompetitionTeamTable(input: {team_id: "${team_id}", draw: ${draw}, lose: ${lose}, win: ${win}, score: ${score}}) {
        team_id
      }
    }
    `
}

export const queryMatchByBoard = (board: string) => {
    return `query MyQuery {
      listMegatonMatches(filter: {board: {contains: "${board}"}}) {
        items {
          match_id
        }
      }
    }`
}

export const queryGroupStageTeams = (board: string) => {
    return `
        query MyQuery {
          listMegatonCompetitionTeamTables(filter: {board: {contains: "${board}"}}) {
            items {
              board
              brand
              draw
              lose
              score
              team
              team_id
              win
            }
          }
        }
    `
}


export const checkMatchExist = (match: string) => {
    return `
    query MyQuery {
      listMegatonMatches(filter: {board: {contains: "${match}"}}, limit: 200) {
        items {
          match_id
        }
      }
    }
    `
}
