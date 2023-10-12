import { RockPaperScissorsInputForm } from "../../components/games/RockPaperScissorsInputForm"
import { LatestBetsBox } from "../../components/LatestBetsBox"
export default function RockPaperScissor() {
    return (
        <>
            <RockPaperScissorsInputForm />
            <LatestBetsBox game="RockPaperScissors" />
        </>
    )
}
