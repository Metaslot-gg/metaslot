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

export const UserBetsList = gql`
    query PlayerBetsHistory($playerAddress: String, $skip: Int, $limit: Int) {
        GamePlayAndOutcomeMany(
            filter: { playerAddress: $playerAddress }
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

export const UserInfo = gql`
    query UserInfo($address: String) {
        UserOne(filter: { address: $address }) {
            address
            gameCounts {
                name
                count
            }
            grossProfit
            hightestMultiplier
            hightestWin
            netProfit
            totalNumBets
            totalBetsLoss
            totalBetsWon
            totalWagered
            username
            createdAt
        }
    }
`

export const LeaderBoard = gql`
    query LeaderBoard($limit: Int, $sortBy: SortFindManyUserInput) {
        UserMany(limit: $limit, sort: $sortBy) {
            address
            username
            grossProfit
            netProfit
            weeklyGrossProfit
            monthlyGrossProfit
            weeklyNetProfit
            monthlyNetProfit
        }
    }
`
