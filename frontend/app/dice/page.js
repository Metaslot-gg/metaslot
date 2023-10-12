import React from "react"
import { DiceInputForm } from "../../components/games/DiceInputForm"
import { LatestBetsBox } from "../../components/LatestBetsBox"
export default function Dice() {
    return (
        <div className="w-full pl-10">
            <DiceInputForm />
            <LatestBetsBox game="Dice" />
        </div>
    )
}
