import { CoinFlipInputForm } from "../../components/games/CoinFlipInputForm"
import { LatestBetsBox } from "../../components/LatestBetsBox"
export default function FlipCoin() {
    return (
        <>
            <CoinFlipInputForm />
            <LatestBetsBox game="CoinFlip" />
        </>
    )
}
