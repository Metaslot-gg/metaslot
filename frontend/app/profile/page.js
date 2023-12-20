import React from "react"
import { UserInfoBox } from "./components/UserInfoBox"
import { UserBetsHistoryBox } from "./components/UserBetsHistoryBox"

export default function Profile() {
    return (
        <div className="w-full pl-10">
            <UserInfoBox />
            <UserBetsHistoryBox />
        </div>
    )
}
