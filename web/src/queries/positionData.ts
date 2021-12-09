import { gql, request  } from 'graphql-request'

export const getActivePositions = async () =>  {
  console.log(process.env.REACT_APP_SUBGRAPH_URL)
  const query = gql`
  query getTotalActivePositions {
    farmingData(id:"0") {
      totalActivePositions
    }
  }
  `
  try {
    let results = await request(process.env.REACT_APP_SUBGRAPH_URL, query, {})
    return results.farmingData.totalActivePositions
  }  catch (e) {
    console.log(e)
    return []
  }
}

export const getActivePositionsForFarm = async (farmid:string) =>  {
  console.log(process.env.REACT_APP_SUBGRAPH_URL)
  const query = gql`
  query getActivePositionsForFarm($farmid:ID!) {
    farm(id:$farmid) {
      activePositions 
    }
  }
  `
  try {
    let results = await request(process.env.REACT_APP_SUBGRAPH_URL, query, {farmid: farmid})
    return results.farm.activePositions

  }  catch (e) {
    console.log(e)
    return []
  }
}
