"use client"
import { Web3Button } from "@web3modal/react"
import { Web3NetworkSwitch } from "@web3modal/react"
import { Logo } from "./icons/SvgIcons"

export function Headers(props) {
    return (
        <header className="py-3 md:py-5">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center header h-16 px-4">
                    <div>
                        <a className="link">
                            <Logo />
                        </a>
                    </div>
                    <div className="grow">
                        <a className="link font-bold no-underline text-5xl text-white">MetaSlot</a>
                    </div>
                    <Web3NetworkSwitch />
                    <Web3Button icon="hide" balance="hide" />
                </div>
            </div>
        </header>
    )
}
