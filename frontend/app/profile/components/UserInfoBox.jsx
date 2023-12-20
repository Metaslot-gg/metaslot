"use client"

import React, { useEffect } from "react"
import { UserInfo } from "../../../graphql/queries"
import { useAccount, useNetwork } from "wagmi"
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr"
import _ from "lodash"

const ProfileStatItem = ({ icon, iconWidth, iconHeight, contentLabel, contentValue }) => {
    return (
        <div className="stat-item flex flex-row space-x-4">
            <div className="stat-item-icon">
                <img src={icon} width={iconWidth} height={iconHeight} />
            </div>
            <div className="stat-item-content flex flex-col justify-center">
                <label className="content-label">{contentLabel}</label>
                <span className="content-value">{contentValue}</span>
            </div>
        </div>
    )
}

export function UserInfoBox() {
    const { address, isConnected } = useAccount()
    const [userAddress, setUserAddress] = React.useState("")
    const [userCreatedAt, setUserCreated] = React.useState("")
    // const [favoriteGame, setFavoriteGame] = React.useState("")
    // const { loading, error, data: rst } = useQuery(UserInfo, { variables: { address: address } })
    const { loading, error, data } = useQuery(UserInfo, { variables: { address: address } })
    const favoriteGame = _.max(data?.UserOne?.gameCounts, _.count) || ""
    const memberSince = data?.UserOne?.createdAt
        ? new Date(data?.UserOne?.createdAt).toLocaleDateString("en-US")
        : ""

    React.useEffect(() => {
        if (isConnected) {
            setUserAddress(address)
        }
    }, [])

    return (
        <div className="profile-section">
            <div className="profile-box flex flex-row p-8 space-x-8 rounded-md">
                <div className="avatar">
                    <img src="/images/profile-avatar-default.png" width={120} height={120} />
                </div>
                <div className="user-info flex flex-col justify-center">
                    <div className="user-address">{userAddress}</div>
                    <div className="user-created-at">Member since: {memberSince}</div>
                </div>
            </div>

            <div className="profile-stats flex py-4 justify-center">
                <div className="bg-base-100">
                    <div className="text-2xl p-2 font-medium">Statistic</div>
                    <div className="grid grid-cols-4 content-center gap-y-4 p-6 rounded-lg bg-base-200">
                        <ProfileStatItem
                            icon="/images/svg/profile-wager.svg"
                            iconWidth={64}
                            iconHeight={64}
                            contentLabel="Wagered"
                            contentValue={data?.UserOne?.totalWagered}
                        />
                        <ProfileStatItem
                            icon="/images/svg/profile-bets.svg"
                            iconWidth={38}
                            iconHeight={64}
                            contentLabel="Bets"
                            contentValue={data?.UserOne?.totalNumBets}
                        />
                        <ProfileStatItem
                            icon="/images/svg/profile-win.svg"
                            iconWidth={64}
                            iconHeight={64}
                            contentLabel="Bets Won"
                            contentValue={data?.UserOne?.totalBetsWon}
                        />
                        <ProfileStatItem
                            icon="/images/svg/profile-loss.svg"
                            iconWidth={64}
                            iconHeight={64}
                            contentLabel="Bets Loss"
                            contentValue={data?.UserOne?.totalBetsLoss}
                        />
                        <ProfileStatItem
                            icon="/images/svg/profile-highest-win.svg"
                            iconWidth={64}
                            iconHeight={64}
                            contentLabel="Highest Won"
                            contentValue={data?.UserOne?.hightestWin}
                        />
                        <ProfileStatItem
                            icon="/images/svg/profile-highest-multiplier.svg"
                            iconWidth={64}
                            iconHeight={64}
                            contentLabel="Highest Multiplier"
                            contentValue={`${data?.UserOne?.hightestMultiplier || ""} x`}
                        />
                        <ProfileStatItem
                            icon="/images/svg/profile-favorite-game.svg"
                            iconWidth={64}
                            iconHeight={64}
                            contentLabel="Favorite Game"
                            contentValue={favoriteGame.name}
                        />
                        <ProfileStatItem
                            icon="/images/svg/profile-total-gross.svg"
                            iconWidth={64}
                            iconHeight={64}
                            contentLabel="Gross Profit"
                            contentValue={data?.UserOne?.grossProfit}
                        />
                        <ProfileStatItem
                            icon="/images/svg/profile-net-profit.svg"
                            iconWidth={64}
                            iconHeight={64}
                            contentLabel="Net Profit"
                            contentValue={data?.UserOne?.netProfit}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
