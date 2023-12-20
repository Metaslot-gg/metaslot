import { envs } from "./index"

export const ChainConfig = {
    // polygon
    137: {
        Contracts: {
            Dice: envs.POLYGON_DICE_ADDRESS,
            CoinFlip: envs.POLYGON_COIN_FLIP_ADDRESS,
            RockPaperScissors: envs.POLYGON_RPS_ADDRESS,
        },
        Explorer: "https://polygonscan.com/",
    },
    80001: {
        Contracts: {
            Dice: envs.MUMBAI_DICE_ADDRESS,
            CoinFlip: envs.MUMBAI_COIN_FLIP_ADDRESS,
            RockPaperScissors: envs.MUMBAI_RPS_ADDRESS,
        },
        Explorer: "https://mumbai.polygonscan.com",
    },
    // Arbitrum
    42161: {
        Contracts: {
            Dice: envs.ARBITRUM_DICE_ADDRESS,
            CoinFlip: envs.ARBITRUM_COIN_FLIP_ADDRESS,
            RockPaperScissors: envs.ARBITRUM_RPS_ADDRESS,
        },
        Explorer: "https://arbiscan.io",
    },
    42170: {
        Contracts: {
            Dice: envs.ARBITRUM_GOERLI_DICE_ADDRESS,
            CoinFlip: envs.ARBITRUM_GOERLI_DICE_ADDRESS,
            RockPaperScissors: envs.ARBITRUM_GOERLI_RPS_ADDRESS,
        },
        Explorer: "https://testnet.arbiscan.io",
    },
    // Findora side chain
    1204: {
        Contracts: {
            Dice: envs.FINDORA_GSC_DICE_ADDRESS,
            CoinFlip: envs.FINDORA_GSC_COIN_FLIP_ADDRESS,
            RockPaperScissors: envs.FINDORA_GSC_RPS_ADDRESS,
        },
        Explorer: "https://gsc-mainnet.evm.findorascan.io",
    },
    1205: {
        Contracts: {
            Dice: envs.FINDORA_GSC_TEST_DICE_ADDRESS,
            CoinFlip: envs.FINDORA_GSC_TEST_COIN_FLIP_ADDRESS,
            RockPaperScissors: envs.FINDORA_GSC_TEST_RPS_ADDRESS,
        },
        Explorer: "https://gsc-testnet.evm.findorascan.io",
    },
    // bnb
    56: {
        Contracts: {
            Dice: envs.BSC_DICE_ADDRESS,
            CoinFlip: envs.BSC_COIN_FLIP_ADDRESS,
            RockPaperScissors: envs.BSC_RPS_ADDRESS,
        },
        Explorer: "https://bscscan.com",
    },
    97: {
        Contracts: {
            Dice: envs.BSC_TEST_DICE_ADDRESS,
            CoinFlip: envs.BSC_TEST_COIN_FLIP_ADDRESS,
            RockPaperScissors: envs.BSC_TEST_RPS_ADDRESS,
        },
        Explorer: "https://testnet.bscscan.com",
    },
}
