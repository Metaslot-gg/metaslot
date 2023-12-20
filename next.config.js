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
    // experimental: {
    //    appDir: true,
    // },
    webpack: (config) => {
        config.externals.push("pino-pretty", "lokijs", "encoding")
        config.resolve.fallback = { fs: false }
        return config
    },
    async headers() {
        return [
            {
                // matching all API routes
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
                    },
                ],
            },
        ]
    },
}
module.exports = nextConfig
// export default nextConfig
