export const queryMatches = `
    query MyQuery {
        listGameMatches {
            items {
                img1Id
                img2Id
                match_id
                name1
                name2
                score1
                score2
            }
        }
    }
`

export const updateMatchScore = (match_id: string, score1: number, score2: number, img1Id: number, img2Id: number, name1: string, name2: string) => {
    return `
        mutation MyMutation {
          updateMegatonMatch(input: {match_id: "${match_id}", score1: ${score1}, score2: ${score2}}) {
            score1
            score2
            brand1
            match_id
            brand2
            table
            live
            board
            team2
            team1
          }
        }
    `
}

export const queryMatchById = (match_id: string) => {
    return `
    query MyQuery {
      listMegatonMatches(filter: {match_id: {eq: "${match_id}"}}, limit: 300) {
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
}

export const mutateMatch = (match_id: string, live: number) => {
    return `
    mutation MyMutation {
      updateMegatonMatch(input: {match_id: "${match_id}", live: ${live}}) {
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


