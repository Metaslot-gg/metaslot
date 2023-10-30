"use client"
import React, { useState } from "react"
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr"
import { LeaderBoard } from "../../../graphql/queries.js"
import _ from "lodash"
import { formatAddress, envs } from "../../../utils/index.js"

export function LeaderBoardTabs() {
    const [activeTab, setActiveTab] = useState(5)
    const sortByValues = [
        "WEEKLYGROSSPROFIT_DESC",
        "MONTHLYGROSSPROFIT_DESC",
        "GROSSPROFIT_DESC",
        "WEEKLYNETPROFIT_DESC",
        "MONTHLYNETPROFIT_DESC",
        "NETPROFIT_DESC",
    ]
    const { loading, error, data } = useQuery(LeaderBoard, {
        variables: { limit: envs.METASLOT_TABLE_ROWS, sortBy: sortByValues[activeTab] },
    })

    const getValue = (tabId, item) => {
        return tabId == 0
            ? item.weeklyGrossProfit
            : tabId == 1
            ? item.monthlyGrossProfit
            : tabId == 2
            ? item.grossProfit
            : tabId == 3
            ? item.weeklyNetProfit
            : tabId == 4
            ? item.monthlyNetProfit
            : item.netProfit
    }

    const TabButton = ({ idx, name }) => {
        return (
            <a
                className={`tab ${activeTab == idx ? "tab-active" : ""}`}
                onClick={() => {
                    setActiveTab(idx)
                }}
            >
                {name}
            </a>
        )
    }

    const TopThreeCard = ({ item, order, badge }) => {
        return (
            <div className={`w-1/3 pt-2 px-2 rounded-md ${order}`}>
                <div className="flex flex-col bg-secondary h-full rounded-md shadow-xl">
                    <div className="flex flex-row justify-center items-center my-6 space-x-2">
                        <div>
                            <img src={badge} width={40} />
                        </div>
                        <div className="user-name text-2xl font-bold">
                            <span>{item.username || formatAddress(item.address)}</span>
                        </div>
                    </div>
                    <div className="divider m-0"></div>
                    <div className="user-value h-full flex items-center justify-center">
                        <span className="text-4xl align-middle">{getValue(activeTab, item)}</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="leader-board">
            <div className="tab-group flex flex-row justify-between gap-5">
                <div className="volume">
                    <div className="flex justify-center">
                        <label className="label text-2xl font-medium">Volume</label>
                    </div>
                    <div className="tabs tabs-boxed">
                        <TabButton idx={0} name="Weekly" />
                        <TabButton idx={1} name="Monthly" />
                        <TabButton idx={2} name="All" />
                    </div>
                </div>
                <div className="volume">
                    <div className="flex justify-center">
                        <label className="label text-2xl font-medium">Net Profit</label>
                    </div>
                    <div className="tabs tabs-boxed">
                        <TabButton idx={3} name="Weekly" />
                        <TabButton idx={4} name="Monthly" />
                        <TabButton idx={5} name="All" />
                    </div>
                </div>
            </div>
            <div className="mt-10 flex flex-row justify-between gap-x-8 items-end">
                {data?.UserMany[1] && (
                    <TopThreeCard
                        item={data?.UserMany[1]}
                        order="leader-board-second"
                        badge="/images/star-2.png"
                    />
                )}
                {data?.UserMany[0] && (
                    <TopThreeCard
                        item={data?.UserMany[0]}
                        order="leader-board-first"
                        badge="/images/star-1.png"
                    />
                )}
                {data?.UserMany[2] && (
                    <TopThreeCard
                        item={data?.UserMany[2]}
                        order="leader-board-third"
                        badge="/images/star-3.png"
                    />
                )}
            </div>
            <div className="leader-board-table py-8 justify-center">
                <div className="bg-base-100">
                    <table className="table table-zebra text-xl">
                        {/* head */}
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Player</th>
                                <th>{activeTab < 3 ? "Volume" : "Net Profit"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {_.map(data?.UserMany, (item, idx) => {
                                return (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td> {item.username || formatAddress(item.address)}</td>
                                        <td> {getValue(activeTab, item)}</td>
                                        {/* <td>{ethers.utils.formatEther(item.totalProfitInDollor, { commify: true })}</td> */}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
