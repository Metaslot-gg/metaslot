"use client"

import { ApolloLink, HttpLink } from "@apollo/client"
import {
    ApolloNextAppProvider,
    NextSSRInMemoryCache,
    NextSSRApolloClient,
} from "@apollo/experimental-nextjs-app-support/ssr"

import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum"
import { Web3Modal } from "@web3modal/react"
import { configureChains, createConfig, WagmiConfig } from "wagmi"
import { polygonMumbai, polygon, arbitrum, arbitrumGoerli, bsc, bscTestnet } from "wagmi/chains"
import { alchemyProvider } from "wagmi/providers/alchemy"
import utils from "../utils/index"
import _ from "lodash"

// have a function to create a client for you
function makeClient() {
    const httpLink = new HttpLink({
        uri: utils.envs.GRAPHQL_URL,
        fetchOptions: { cache: "no-store" },
    })

    const client = new NextSSRApolloClient({
        cache: new NextSSRInMemoryCache(),
        link: httpLink,
    })

    return client
}

// wallet connect
const chainList = [
    polygonMumbai,
    polygon,
    arbitrum,
    arbitrumGoerli,
    bsc,
    bscTestnet,
    utils.Findora_Gsc,
    utils.Findora_Gsc_Test,
]

// console.log(utils.envs.CHAIN_IDS)
// console.log(utils.envs.CHAIN_IDS.includes(polygonMumbai.id))
const chains = _.filter(chainList, (c) => {
    console.log(c.id, utils.envs.CHAIN_IDS, utils.envs.CHAIN_IDS.includes(c.id))
    return utils.envs.CHAIN_IDS.includes(c.id)
})
// console.log(chains)

const bscJsonProvider = (chain) => {
    if (chain.id == bsc.id || chain.id == bscTestnet.id) {
        return {
            chain: chain.id == bsc.id ? bsc : bscTestnet,
            rpcUrls: chain.rpcUrls.default,
        }
    } else {
        return null
    }
}

const findoraJsonProvider = (chain) => {
    if (chain.id == utils.Findora_Gsc.id || chain.id == utils.Findora_Gsc_Test.id) {
        return {
            chain: chain.id == utils.Findora_Gsc.id ? utils.Findora_Gsc : utils.Findora_Gsc_Test,
            rpcUrls: chain.rpcUrls.default,
        }
    } else {
        return null
    }
}

const { publicClient } = configureChains(chains, [
    alchemyProvider({ apiKey: utils.envs.ALCHEMY_APIKEY }),
    findoraJsonProvider,
    bscJsonProvider,
])

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({ projectId: utils.envs.WALLET_CONNECT_PROJECT_ID, chains }),
    publicClient,
})

const ethereumClient = new EthereumClient(wagmiConfig, chains)

// you need to create a component to wrap your app in
export function ClientWrapper({ children }) {
    return (
        <ApolloNextAppProvider makeClient={makeClient}>
            <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
            <Web3Modal
                projectId={utils.envs.WALLET_CONNECT_PROJECT_ID}
                ethereumClient={ethereumClient}
                themeVariables={{
                    "--w3m-font-family": "Roboto, sans-serif",
                    "--w3m-accent-color": "#A9A0FF",
                    "--w3m-background-border-radius": "0px",
                }}
            />
        </ApolloNextAppProvider>
    )
}
