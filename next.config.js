/** @type {import('next').NextConfig} */

/**
 * upgrade next 12 -> 13 with app dir structure
 * To fix module no fount errors from wallet connect,
 * add experimental.appDir: true and webpack with missing deps
 * https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
 */
const nextConfig = {
    basePath: "",
    distDir: "./build",
    experimental: {
        appDir: true,
    },
    webpack: (config) => {
        config.externals.push("pino-pretty", "lokijs", "encoding")
        return config
    },
}
module.exports = nextConfig
// export default nextConfig
