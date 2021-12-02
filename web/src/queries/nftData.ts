import { gql, request  } from 'graphql-request'

export const getUserNFTs = async (user:string) =>  {
  console.log(process.env.REACT_APP_SUBGRAPH_URL)
  const query = gql`
    query getUserNFTs($owner: Bytes!) {
      ownerships(where: {owner: $owner }) {
      nft {
        tokenID
        tokenURI
        contract {
          id
          name
        }
      }
    }
  }
  `
  try {
    let results = await request(process.env.REACT_APP_SUBGRAPH_URL, query, {owner: user})
    return results.ownerships.map((ownership) => {
      return ownership.nft
    })
  }  catch (e) {
    console.log(e)
    return []
  }
}
