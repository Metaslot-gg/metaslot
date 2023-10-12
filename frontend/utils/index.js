import dotenv from "dotenv"

const Boundary = 99 * 10 ** 9
const Max_Multiplier = 99 * 10 ** 5
const Min_Multiplier = 10421
const Max_Range_Number = 10 ** 7
const Min_WinChance = 0.1 * 10 ** 5
const Max_WinChance = 95 * 10 ** 5

dotenv.config()

const envs = {
    //general config
    MONGODB_URI: process.env.MONGODB_URI || "",
    ALCHEMY_APIKEY: process.env.NEXT_PUBLIC_ALCHEMY_APIKEY || "",
    WALLET_CONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
    GRAPHQL_URL:
        process.env.NEXT_PUBLIC_VERCEL_ENV == "local"
            ? "http://localhost:4000/api/graphql"
            : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/graphql`,
    // contracts - mumbai
    MUMBAI_DICE_ADDRESS: process.env.NEXT_PUBLIC_MUMBAI_DICE_ADDRESS || "",
    MUMBAI_COIN_FLIP_ADDRESS: process.env.NEXT_PUBLIC_MUMBAI_COIN_FLIP_ADDRESS || "",
    MUMBAI_RPS_ADDRESS: process.env.NEXT_PUBLIC_MUMBAI_ROCK_PAPER_SCISSORS || "",
    // contracts - polygon
    POLYGON_DICE_ADDRESS: process.env.NEXT_PUBLIC_POLYGON_DICE_ADDRESS || "",
    POLYGON_COIN_FLIP_ADDRESS: process.env.NEXT_PUBLIC_POLYGON_COIN_FLIP_ADDRESS || "",
    POLYGON_RPS_ADDRESS: process.env.NEXT_PUBLIC_POLYGON_ROCK_PAPER_SCISSORS || "",
    // contract - arbitrum
    ARBITRUM_DICE_ADDRESS: process.env.NEXT_PUBLIC_ARBITRUM_DICE_ADDRESS || "",
    ARBITRUM_COIN_FLIP_ADDRESS: process.env.NEXT_PUBLIC_ARBITRUM_COIN_FLIP_ADDRESS || "",
    ARBITRUM_RPS_ADDRESS: process.env.NEXT_PUBLIC_ARBITRUM_ROCK_PAPER_SCISSORS || "",
    // contract - arbitrum goerli
    ARBITRUM_GOERLI_DICE_ADDRESS: process.env.NEXT_PUBLIC_ARBITRUM_GOERLI_DICE_ADDRESS || "",
    ARBITRUM_GOERLI_DICE_ADDRESS: process.env.NEXT_PUBLIC_ARBITRUM_GOERLI_COIN_FLIP_ADDRESS || "",
    ARBITRUM_GOERLI_RPS_ADDRESS: process.env.NEXT_PUBLIC_ARBITRUM_GOERLI_ROCK_PAPER_SCISSORS || "",
    // contract - findora gsc
    FINDORA_GSC_DICE_ADDRESS: process.env.NEXT_PUBLIC_BSC_DICE_ADDRESS || "",
    FINDORA_GSC_COIN_FLIP_ADDRESS: process.env.NEXT_PUBLIC_BSC_COIN_FLIP_ADDRESS || "",
    FINDORA_GSC_RPS_ADDRESS: process.env.NEXT_PUBLIC_BSC_ROCK_PAPER_SCISSORS || "",
    // contract - findora gsc test
    FINDORA_GSC_TEST_DICE_ADDRESS: process.env.NEXT_PUBLIC_BSC_TEST_DICE_ADDRESS || "",
    FINDORA_GSC_TEST_COIN_FLIP_ADDRESS: process.env.NEXT_PUBLIC_BSC_TEST_COIN_FLIP_ADDRESS || "",
    FINDORA_GSC_TEST_RPS_ADDRESS: process.env.NEXT_PUBLIC_MUMBAI_BSC_TEST_PAPER_SCISSORS || "",
    // contract - bsc
    BSC_DICE_ADDRESS: process.env.NEXT_PUBLIC_BSC_DICE_ADDRESS || "",
    BSC_COIN_FLIP_ADDRESS: process.env.NEXT_PUBLIC_BSC_COIN_FLIP_ADDRESS || "",
    BSC_RPS_ADDRESS: process.env.NEXT_PUBLIC_BSC_ROCK_PAPER_SCISSORS || "",
    // contract - bsc test
    BSC_TEST_DICE_ADDRESS: process.env.NEXT_PUBLIC_BSC_TEST_DICE_ADDRESS || "",
    BSC_TEST_COIN_FLIP_ADDRESS: process.env.NEXT_PUBLIC_BSC_TEST_COIN_FLIP_ADDRESS || "",
    BSC_TEST_RPS_ADDRESS: process.env.NEXT_PUBLIC_MUMBAI_BSC_TEST_PAPER_SCISSORS || "",
}

const Findora_Gsc_Test = {
    id: 1024,
    name: "Findora GSC Testnet",
    network: "findora gsc testnet",
    nativeCurrency: {
        decimals: 18,
        name: "Findora",
        symbol: "wfra",
    },
    rpcUrls: {
        public: { http: ["https://gsc-testnet.prod.findora.org:8545/"] },
        default: { http: ["https://gsc-testnet.prod.findora.org:8545/"] },
    },
    blockExplorers: {
        etherscan: { name: "findora scan", url: "https://gsc-testnet.evm.findorascan.io/" },
        default: { name: "findora scan", url: "https://gsc-testnet.evm.findorascan.io/" },
    },
    testnet: true,
}

const Findora_Gsc = {
    id: 1025,
    name: "Findora GSC",
    network: "findora gsc ",
    nativeCurrency: {
        decimals: 18,
        name: "Findora",
        symbol: "wfra",
    },
    rpcUrls: {
        public: {
            http: ["https://gsc-mainnet.prod.findora.org:8545/"],
        },
        default: {
            http: ["https://gsc-mainnet.prod.findora.org:8545/"],
        },
    },
    blockExplorers: {
        etherscan: { name: "findora scan", url: "https://gsc-mainnet.prod.findora.org:8545/" },
        default: { name: "findora scan", url: "https://gsc-mainnet.prod.findora.org:8545/" },
    },
    testnet: false,
}

function formatAddress(address) {
    return address.slice(0, 6) + "..." + address.slice(-4)
}

function handleMultiplierChange(multiplier, isOver) {
    const winChance = Math.floor(Boundary / multiplier)
    const rangeNumber = isOver ? Max_Range_Number - winChance : winChance
    return { rangeNumber, winChance }
}

function handleRangeChange(range, isOver) {
    const targetedRange = isOver ? range : Max_Range_Number - range
    const winChance = Max_Range_Number - targetedRange
    const multiplier = Math.floor(Boundary / winChance)
    return { winChance, multiplier }
}

function handleWinChanceChange(winChance, isOver) {
    const multiplier = Math.floor(Boundary / winChance)
    const rangeNumber = isOver ? Max_Range_Number - winChance : winChance
    return { rangeNumber, multiplier }
}

function formatRangeNumber(rawRange) {
    return (rawRange / 10 ** 5).toFixed(1)
}

function toRawRangeNumber(formattedRangeNumber) {
    return parseFloat(formattedRangeNumber) * 10 ** 5
}

function formatRawMultiplier(rawMultiplier) {
    return (rawMultiplier / 10000.0).toFixed(4)
}

function toRawMultiplier(formattedMultiplier) {
    return parseFloat(formattedMultiplier) * 10000
}

function formatRawWinChance(rawWinChance) {
    return (rawWinChance / 10.0 ** 5).toFixed(2)
}

function toRawWinChance(formattedWinChance) {
    return parseFloat(formattedWinChance) * 10 ** 5
}

module.exports = {
    envs,
    Findora_Gsc,
    Findora_Gsc_Test,
    handleMultiplierChange,
    handleRangeChange,
    handleWinChanceChange,
    formatRangeNumber,
    formatRawWinChance,
    formatRawMultiplier,
    toRawRangeNumber,
    toRawMultiplier,
    toRawWinChance,
    formatAddress,
    Max_Multiplier,
    Min_Multiplier,
    Min_WinChance,
    Max_WinChance,
}
