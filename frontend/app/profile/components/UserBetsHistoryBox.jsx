"use client"
import React from "react"
import { DiceSvg, WinSvg, CoinFlipSvg, RpsSvg } from "../../../components/icons/SvgIcons"
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr"
import { UserBetsList } from "../../../graphql/queries.js"
import _ from "lodash"
import { ethers } from "ethers"
import { formatAddress, envs } from "../../../utils"
import { ChainConfig } from "../../../utils/config"
import { useAccount, useNetwork } from "wagmi"

const GameLabel = ({ game }) => {
    return game == "Dice" ? (
        <span className="flex flex-row">
            <DiceSvg /> <span className="ml-2">Dice</span>
        </span>
    ) : game == "CoinFlip" ? (
        <span className="flex flex-row">
            <CoinFlipSvg /> <span className="ml-2">Coin Flip</span>
        </span>
    ) : game == "RockPaperScissors" ? (
        <span className="flex flex-row">
            <RpsSvg /> <span className="ml-2">Rock Paper Scissors</span>
        </span>
    ) : (
        <span>Unknown</span>
    )
}

const TransactionLink = ({ txHash, txTmp, explorer }) => {
    const date = new Date(txTmp * 1000)
    return (
        <a className="link link-accent" target="_blank" href={`${explorer}/tx/${txHash}`}>
            {date.toLocaleDateString()}
        </a>
    )
}

const MultiplierFormatter = ({ multiplier }) => {
    const formattedMultiplier = multiplier / 10421
    return `${formattedMultiplier.toFixed(2)} x`
}

const ListBets = ({ data, explore }) => {
    return _.map(data, (item) => {
        return (
            <tr key={item.requestId}>
                <td>
                    <TransactionLink
                        explorer={explore}
                        txHash={item.outcomeTxHash}
                        txTmp={item.outcomeTxTmp}
                    />
                </td>
                <td>
                    <GameLabel game={item.gameName} />
                </td>
                <td>{formatAddress(item.playerAddress)}</td>
                <td>
                    {Number(item.wager).toLocaleString("en-US")} x {item.numBets}
                </td>
                <td>
                    {item.multiplier ? <MultiplierFormatter multiplier={item.multiplier} /> : "-"}
                </td>
                <td>{item.totalProfitInDollor.toLocaleString("en-US")}</td>
                {/* <td>{ethers.utils.formatEther(item.totalProfitInDollor, { commify: true })}</td> */}
            </tr>
        )
    })
}

export function UserBetsHistoryBox() {
    const limit = envs.METASLOT_TABLE_ROWS
    const { address, isConnected } = useAccount()
    const { chain } = useNetwork()
    const { loading, error, data } = useQuery(UserBetsList, {
        variables: { playerAddress: address, skip: 0, limit: limit },
    })

    const explorer = isConnected ? ChainConfig[chain.id] : "https://bscscan.com/"

    return (
        <section className="live-bets flex py-8 justify-center">
            <div className="collapse bg-base-100">
                <input type="radio" name="my-accordion-1" checked="checked" readOnly />
                <div className="collapse-title text-4xl font-medium">Your Latest Bets</div>
                <div className="overflow-x-auto">
                    <table className="table text-xl">
                        {/* head */}
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Game</th>
                                <th>Player</th>
                                <th>Wager</th>
                                <th>Multiplier</th>
                                <th>Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.GamePlayAndOutcomeMany && (
                                <ListBets data={data.GamePlayAndOutcomeMany} explore={explorer} />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    )
}
