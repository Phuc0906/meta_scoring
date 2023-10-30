export const onUpdateMatch = `
    subscription MySubscription {
        onUpdateGameMatch {
            img1Id
            img2Id
            match_id
            name1
            name2
            score1
            score2
        }
    }
`
