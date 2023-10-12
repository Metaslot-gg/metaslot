"use client"
import "../styles/globals.css"

import { Footer } from "../components/Footer"
import { LeftSide } from "../components/LeftSide"
import { Headers } from "../components/Header"
import { ClientWrapper } from "../components/ClientWrapper"

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body suppressHydrationWarning={true}>
                <ClientWrapper>
                    {/* flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip */}
                    <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip bg-primary">
                        <div className="pt-0 flex flex-col w-full items-stretch md:fex-row md:items-start max-w-full md:max-w-8xl md:mx-auto min-h-screen">
                            <Headers />
                            <main className="grow">
                                <div className="pb-12 pt-10 md:pt-16">
                                    <div className="flex flex-row max-w-6xl mx-auto">
                                        <section className="basis-1/5 bg-secondary pl-4 pt-4 pr-4">
                                            <LeftSide />
                                        </section>
                                        <main className="basis-4/5 bg-primary pl-8 pr-8 pt-4 w-full">
                                            {children}
                                        </main>
                                    </div>
                                </div>
                            </main>
                            <Footer />
                        </div>
                    </div>
                </ClientWrapper>
            </body>
        </html>
    )
}
