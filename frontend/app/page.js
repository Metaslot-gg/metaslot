import Image from "next/image"
import { HomeFeature } from "../components/HomeFeature"
import { LatestBetsBox } from "../components/LatestBetsBox"
import { StatBox } from "../components/StatBox"

export default function Home() {
    return (
        <>
            {/* <section>
                <div className="flex justify-center">
                    <div>
                        <Image src="/images/banner-2.png" alt="logo" width="840" height="318" />
                    </div>
                </div>
            </section> */}
            {/* <section className="game-list flex py-8 justify-between">
                <div className="dice-card card w-60 bg-base-100 shadow-xl image-normal mr-10 pt-10">
                    <figure>
                        <img src="/images/game-place-holder-home.png" alt="Dice" />
                    </figure>
                </div>
                <div className="flip-coin-card card w-60 bg-base-100 shadow-xl image-normal mr-10 pt-10">
                    <figure>
                        <img src="/images/game-place-holder-home.png" alt="Coin Flip" />
                    </figure>
                </div>
                <div className="rock-paper-scissor-card card w-60 bg-base-100 shadow-xl image-normal pt-10">
                    <figure>
                        <img src="/images/game-place-holder-home.png" alt="Rock Paper Scissors" />
                    </figure>
                </div>
            </section> */}
            <StatBox />
            <LatestBetsBox />
            {/* <HomeFeature /> */}
        </>
    )
}
