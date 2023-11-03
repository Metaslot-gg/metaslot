const networkConfig = {
    default: {
        name: "hardhat",
        fee: "100000000000000000",
        keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        jobId: "29fa9aa13bf1468788b7cc4a500a45b8",
        fundAmount: "1000000000000000000",
        automationUpdateInterval: "30",
    },
    31337: {
        name: "localhost",
        fee: "100000000000000000",
        keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        jobId: "29fa9aa13bf1468788b7cc4a500a45b8",
        fundAmount: "1000000000000000000",
        automationUpdateInterval: "30",
        ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    },
    1: {
        name: "mainnet",
        linkToken: "0x514910771af9ca656af840dff83e8264ecf986ca",
        fundAmount: "0",
        automationUpdateInterval: "30",
    },
    11155111: {
        name: "sepolia",
        linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        keyHash: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        vrfWrapper: "0xab18414CD93297B0d12ac29E63Ca20f515b3DB46",
        oracle: "0x6090149792dAAeE9D1D568c9f9a6F6B46AA29eFD",
        jobId: "ca98366cc7314957b8c012c72f05aeeb",
        subscriptionId: "777",
        fee: "100000000000000000",
        fundAmount: "100000000000000000", // 0.1
        automationUpdateInterval: "30",
    },
    137: {
        name: "polygon",
        linkToken: "0xb0897686c545045afc77cf20ec7a532e3120e0f1",
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
        oracle: "0x0a31078cd57d23bf9e8e8f1ba78356ca2090569e",
        jobId: "12b86114fa9e46bab3ca436f88e1a912",
        fee: "100000000000000",
        fundAmount: "100000000000000",
    },
    80001: {
        name: "mumbai",
        subscriptionId: "5521",
        vaultAddress: "0x7439Ad12742f7b8306b44b7e372b7Da8c03f6d1F",
        linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
        ethUsdPriceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
        keyHash: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
        vrfCoordinator: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
        vrfWrapper: "0x99aFAf084eBA697E584501b8Ed2c0B37Dd136693",
        linkEthFeed: "0x12162c3E810393dEC01362aBf156D7ecf6159528",
        oracle: "0x40193c8518BB267228Fc409a613bDbD8eC5a97b3",
        jobId: "ca98366cc7314957b8c012c72f05aeeb",
        fee: "100000000000000000",
        fundAmount: "100000000000000000", // 0.1
        automationUpdateInterval: "30",
    },
    56: {
        name: "bsc",
        subscriptionId: "",
        keyHash: "0x17cd473250a9a479dc7f234c64332ed4bc8af9e8ded7556aa6e66d83da49f470",
        vrfCoordinator: "0xc587d9053cd1118f25F645F9E08BB98c9712A4EE",
        linkEthFeed: "0xB38722F6A608646a538E882Ee9972D15c86Fc597",
        vaultAddress: "",
    },
    97: {
        name: "bsctest",
        subscriptionId: "3133",
        keyHash: "0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314",
        vrfCoordinator: "0x6A2AAd07396B36Fe02a22b33cf443582f682c82f",
        linkEthFeed: "0x351Ff08FF5077d6E8704A4763836Fe187f074380",
        vaultAddress: "0x1Fb788681D47B88A308042e80963c854dc1941d5",
    },
    2152: {
        name: "findoramainnet",
        subscriptionId: "3133",
        keyHash: "0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314",
        vrfCoordinator: "0x625aD3FC2F49A69529A44709BC04838260B3D862",
        vaultAddress: "0x1D8f4f8c9557cD7d0bC749F03d188dE986b7687C",
    },

    1204: {
        name: "gscmainnet",
        subscriptionId: "1",
        keyHash: "0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314",
        vrfCoordinator: "0x0060e3B2Dc7469ec5747EdE86f4f0d005B571538",
        vaultAddress: "0xA0ad9ca41aC61A115f29b9AdbBA7ba2164D7F08b",
        linkEthFeed: "0x0060e3B2Dc7469ec5747EdE86f4f0d005B571538",

    },
}

const developmentChains = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 6

module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
}
