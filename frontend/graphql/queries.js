import { gql } from "@apollo/client"

export const GetLatestBets = gql`
    query GetLatestBets($skip: Int, $limit: Int) {
        GamePlayAndOutcomeMany(skip: $skip, limit: $limit, sort: OUTCOMETXTMP_DESC) {
            chainId
            gameName
            playerAddress
            wager
            multiplier
            numBets
            payout
            totalProfitInDollor
            totalWageredInDollor
            outcomeTxTmp
            outcomeTxHash
            requestId
        }
    }
`

export const GetLatestBetsForGame = gql`
    query GetLatestBetsForGame($game: String, $skip: Int, $limit: Int) {
        GamePlayAndOutcomeMany(
            filter: { gameName: $game }
            skip: $skip
            limit: $limit
            sort: OUTCOMETXTMP_DESC
        ) {
            chainId
            gameName
            playerAddress
            wager
            multiplier
            numBets
            payout
            totalProfitInDollor
            totalWageredInDollor
            outcomeTxTmp
            outcomeTxHash
            requestId
        }
    }
`

const UserInfo = gql`
    query UserInfo($address: String) {
        # GamePlayAndOutcomeMany(filter: {gameName: $game}, skip: $skip, limit: $limit, sort:
        UserMany(filter: { address: $address }) {
            address
            createAt
            gameCounts {
                name
                count
            }
            grossProfit
            hightestMultiplier
            hightestWin
            netProfit
            totalBets
            totalBetsLoss
            totalBetsWon
            totalWagered
            username
        }
    }
`
