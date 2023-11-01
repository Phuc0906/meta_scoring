export const createTeam = (teamId: string, team: string, brand: number) => {
    return `mutation MyMutation {
        createMegatonCompetitionTeam(input: {board: "", brand: ${brand}, draw: 1, lose: 1, team: "${team}", team_id: "${teamId}", win: 1, score: 1}) {
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
  updateMegatonCompetitionTeam(input: {team_id: "${team_id}", board: "${board}"}) {
    team_id
  }
}
`
}


export const queryTeams = `
query MyQuery {
  listMegatonCompetitionTeams(limit: 40) {
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

export const queryAllTeams = `
query MyQuery {
  listMegatonCompetitionTeams {
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

export const updateTeamScore = (team_id: string , score: string) => {
    return `
    mutation MyMutation {
      updateMegatonCompetitionTeam(input: {team_id: "${team_id}", score: ${score}, win: 2}) {
        team_id
      }
    }
    `
}

export const getTeamByName = (team: string) => {
    return `
    query MyQuery {
      listMetaScoringCompetitions(filter: {team: {contains: "${team}"}}) {
        items {
          board
          brand
          draw
          lose
          team
          team_id
          win
          semi
        }
      }
    }
    `
}
