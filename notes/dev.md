# Development Notes

## Reference website

-   [zkasino](https://play.zkasino.io/)

## Game contracts

-   [Dice.sol](https://polygonscan.com/address/0x66d0152F299422b0874761B4963b9Bd48E777a0E#code)
    -   [x] [deployment contract on polygon mumbai](https://mumbai.polygonscan.com/address/0xdf3edd3b3ee25986c65a27014185c8a2f8b0a807), 0xdf3edd3b3ee25986c65a27014185c8a2f8b0a807

## Random number generator

-   [Chainlink: VRF Intro](https://docs.chain.link/vrf/v2/introduction)
-   [ChainLink: VRF Configuration](https://docs.chain.link/vrf/v2/subscription/supported-networks)
-   [ZKRando](https://github.com/keviinfoes/ZKRandao)

## Bank Roll

-   [Diamond.sol](https://polygonscan.com/address/0x51e99a0d09eeca8d7efec3062ac024b6d0989959#code)
-   [ERC-235 Spec](https://eips.ethereum.org/EIPS/eip-2535)
-   [Diamond Proxy Contracts: Best Practices](https://www.certik.com/resources/blog/7laIe0oZGK6IoYDwn0g2Jp-diamond-proxy-contracts-best-practices)
-   [Diamond Contract](https://polygonscan.com/address/0x480e3ff1a824c5e1f999288e423ab7311470787d#code)
-   [DiamondCutFacet.sol](https://polygonscan.com/address/0x480e3ff1a824c5e1f999288e423ab7311470787d#code)

## Price Data Feed

-   [ChainLink: Data Feed API Reference - AggregatorV3Interface](https://docs.chain.link/data-feeds/api-reference)
-   [ChainLink: Feed Registry API Reference](https://docs.chain.link/data-feeds/feed-registry/feed-registry-functions#latestrounddata)
-   [EACAggregatorProxy.sol](https://polygonscan.com/address/0x5787befdc0ecd210dfa948264631cd53e68f7802#code)
-   [Official ChainLink EACAggregatorProxy.sol deployment on Polygon mumbai](https://docs.chain.link/data-feeds/price-feeds/addresses?network=polygon): [0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada](https://mumbai.polygonscan.com/address/0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada)

## Deployed Contracts on Polygon Mumbai

-   XYZToken:
    -   [x] ERC-20 contract: https://mumbai.polygonscan.com/token/0x35e3c3be8065bae59e58f9d3182af1a333df0e0e
-   Bankroll
    -   [x] Diamond contract:
        -   (thrid) https://mumbai.polygonscan.com/address/0x9aA2847e26a138408C9B1f54Bbb3f8d139547A3a#code 0.8.11
        -   (second) https://mumbai.polygonscan.com/address/0x64cD398499c60efb4b052f1bE7cE088551351a1F
        -   (first) https://mumbai.polygonscan.com/address/0x01fba73c837a0003e008c28fc8120084c1241266
    -   [x] DiamondCutFacet contract: https://mumbai.polygonscan.com/address/0xd5325dd0d7867da3693447de9ffef65716ade871
    -   [x] 0x21d8aA8aAFf60aec7c876dcA1039b35781E0eFD9
-   VRF
    -   [x] Facet for LINK tokens: https://faucets.chain.link/mumbai
    -   [x] Address for VRF coordicators: [0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed](https://mumbai.polygonscan.com/address/0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed)
-   DataFeed
    -   [x] Address for Price data feed- (LINK/Matic): [0x12162c3E810393dEC01362aBf156D7ecf6159528](https://mumbai.polygonscan.com/address/0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada)
-   Native token address: 0x0000000000000000000000000000000000000000
-   Vault: 0xd0a42Bd36858fAE7F15725369B8D82295d6E4471
-   Dice: 0x7243a98002ccdB9E2E35d2A43730AD73F2e1A5fA
-   key hash: [0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4](0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4)
