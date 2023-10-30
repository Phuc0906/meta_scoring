export const queryBusyTable =  `
query MyQuery {
  listMegatonMatches(filter: {table: {ne: 1}}) {
    items {
      table
    }
  }
}
`
