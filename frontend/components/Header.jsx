"use client"
import * as React from "react"
import { Web3Button } from "@web3modal/react"
import { Web3NetworkSwitch } from "@web3modal/react"
import { useAccount } from "wagmi"
import { fetchBalance } from '@wagmi/core'
import { watchAccount, watchNetwork } from '@wagmi/core'
import { Logo } from "./icons/SvgIcons"

export function Headers(props) {

    const { address, isConnected } = useAccount()
    const [balance, setBalance] = React.useState("0.0")    
    const [updateBalance, setUpdateBalance] = React.useState(0)

    const unwatchNetWork = watchNetwork((network) => { 
        setUpdateBalance(updateBalance+1)
    })
    const unwatchAccount = watchAccount((account) => { 
        setUpdateBalance(updateBalance+1)
    })

    React.useEffect(() => {
        async function getBalance() {
            if (address) {
                const rst = await fetchBalance({
                    address: address,
                  })
                setBalance(rst.formatted)
            } else {
                setBalance("0.0") 
            }
        }
        getBalance()
        return () => {}
    }, [setUpdateBalance, updateBalance])

    return (
        <header className="py-3 md:py-5">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center header h-16 px-4">
                    <div>
                        <a className="link">
                            <img src="/images/svg/metaslot.svg" width={52} height={52} />
                        </a>
                    </div>
                    <div className="grow">
                        <a className="link font-bold no-underline text-5xl text-white">Metaslot</a>
                    </div>
                    <div className="badge badge-lg">Balance: {balance}</div>
                    <Web3NetworkSwitch />
                    <Web3Button icon="hide" balance="hide" />
                </div>
            </div>
        </header>
    )
}
