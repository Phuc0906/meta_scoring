import exp from "constants";

export const createMatch = (match_id: string, team1: string, team2: string, brand1: number, brand2: number, board: string) => {
    return `
mutation MyMutation {
    createMegatonMatch(input: {brand1: ${brand1}, brand2: ${brand2}, live: 1, match_id: "${match_id}", score1: 1, score2: 1, team1: "${team1}", team2: "${team2}", table: 1, board: "${board}"}) {
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


export const getAllMatches = `
query MyQuery {
  listMegatonMatches {
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

export const updateGroupStageMatch = (team_id: string, draw: number, lose: number, win: number, semi: number) => {
    return `
    mutation MyMutation {
      updateMetaScoringCompetition(input: {team_id: "${team_id}", draw: ${draw}, lose: ${lose}, win: ${win}}) {
        team_id
      }
    }
    `
}
