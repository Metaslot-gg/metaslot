import React from "react"
import Link from "next/link"
import {
    HomeSvg,
    DiceSvg,
    CoinFlipSvg,
    RpsSvg,
    LeaderBoardSvg,
    ProfileSvg,
    PlaceHolderSvg,
} from "./icons/SvgIcons"

export function LeftSide(props) {
    return (
        <ul className="menu w-60 rounded-box text-lg">
            <li>
                <Link href="/">
                    <HomeSvg /> Home
                </Link>
            </li>
            <div className="divider"></div>
            <li>
                <Link href="/dice">
                    <DiceSvg /> Dice
                </Link>
            </li>
            <li>
                <Link href="/coinflip">
                    <CoinFlipSvg /> Coin Flip
                </Link>
            </li>
            <li>
                <Link href="/rock_paper_scissors">
                    <RpsSvg /> Rock Paper Scissor
                </Link>
            </li>
            <div className="divider"></div>
            <li>
                <Link href="/leader-board">
                    <LeaderBoardSvg /> Leader Board
                </Link>
            </li>
            <li>
                <Link href="/profile">
                    <ProfileSvg /> Profile
                </Link>
            </li>
            <div className="divider"></div>
            <li>
                <Link href="https://twitter.com">
                    <img src="/images/svg/twitter.svg" width={26} height={26} /> Twitter
                </Link>
            </li>
            {/* <li>
                <Link href="/">
                    <img src="/images/svg/instagram.svg" width={26} height={26} /> Instagram
                </Link>
            </li>
             <li>
                <Link href="/">
                    <PlaceHolderSvg /> Medium
                </Link>
            </li>
            <li>
                <Link href="/">
                    <PlaceHolderSvg /> Docs
                </Link>
            </li> */}
        </ul>
    )
}
