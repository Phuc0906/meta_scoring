export const createTeam = (teamId: string, team: string, brand: number, board: string) => {
    return `mutation MyMutation {
        createMegatonCompetitionTeamTable(input: {board: "${board}", brand: ${brand}, draw: 1, lose: 1, team: "${team}", team_id: "${teamId}", win: 1, score: 1}) {
            board
            brand
            draw
            lose
            team_id
            team
            win
        }
    }
`
}

export const updateTeamBoard = (team_id: string, board: string) => {
    return `
mutation MyMutation {
  updateMegatonCompetitionTeamTable(input: {team_id: "${team_id}", board: "${board}"}) {
    team_id
  }
}
`
}


export const queryTeams = `
query MyQuery {
  listMegatonCompetitionTeamTables(limit: 40) {
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
`;


export const updateTeamScore = (team_id: string , score: string) => {
    return `
    mutation MyMutation {
      updateMegatonCompetitionTeamTable(input: {team_id: "${team_id}", score: ${score}, win: 2}) {
        team_id
      }
    }
    `
}

export const getTeamByName = (team: string) => {
    return `
    query MyQuery {
      listMegatonCompetitionTeamTables(filter: {team: {contains: "${team}"}}, limit: 500) {
        items {
          board
          brand
          draw
          lose
          team
          team_id
          win
          score
          
        }
      }
    }
    `
}

export const createRacingTeam = (teamId: string , team: string, brand: number, category: string) => {
    return `
        mutation MyMutation {
          createRacingTeam(input: {brand: ${brand}, category: "${category}", round1: 1, round2: 1, team: "${team}", team_id: "${teamId}"}) {
            team_id
          }
        }
    `
}

export const getRacingTeams = (category: string) => {
  return `
    query MyQuery {
      listRacingTeams(filter: {category: {contains: "${category}"}}) {
        items {
          team_id
          team
          round2
          round1
          category
          brand
        }
      }
    }
    `
}

export const queryAllRacingTeam = `query MyQuery {
  listRacingTeams {
    items {
      team_id
      team
      round2
      round1
      category
      brand
    }
  }
}`;


export const updateRacingTeamRound1 = (team_id: string, time: string) => {
    return `
    mutation MyMutation {
      updateRacingTeam(input: {team_id: "${team_id}", round1: ${time}}) {
        team_id
      }
    }
    `
}

export const updateRacingTeamRound2 = (team_id: string, time: string) => {
    return `
    mutation MyMutation {
      updateRacingTeam(input: {team_id: "${team_id}", round2: ${time}}) {
        team_id
      }
    }
    `
}
