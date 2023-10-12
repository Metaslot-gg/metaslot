import React from "react"

const FeatureCard = (props) => {
    const { icon, title, content, className } = props
    return (
        <div className={`flex flex-col p-8 rounded-lg w-1/3 ${className}`}>
            <div className="flex flex-row">
                <img src={icon} className="w-12 rounded-lg shadow-2xl" />
                <h1 className="text-5xl font-bold ml-6">{title}</h1>
            </div>
            <div className="w-full">
                <p className="py-6 text-xs">{content}</p>
            </div>
        </div>
    )
}

export function HomeFeature(props) {
    return (
        <section className="features py-8 flex flex-row space-x-4">
            <FeatureCard
                icon="/images/fair-betting.png"
                title="Fair Betting"
                className="feature-fair-betting"
                content="Fairness is one of the core values of MetaSlot. We use RANDAO to ensure that
                        our games are completely fair and random, without any human intervention or
                        manipulation. Our smart contracts are open source, anyone can view and
                        verify our game rules and processes."
            />
            <FeatureCard
                icon="/images/no-kyc.png"
                title="No KYC"
                className="feature-no-kyc"
                content="One of the main advantages of our blockchain casino project is that we
                do not require KYC verification and no register needed for our users.
                KYC is a process that financial institutions use to verify the identity
                and risk profile of their customers, but it can also be time-consuming,
                costly, and invasive. The only thing you need is connect the wallet and
                you can add some information you want to share any time."
            />
            <FeatureCard
                icon="/images/security.png"
                title="Security"
                className="feature-security"
                content="Security is one of the key features of MetaSlot. We use encryption
                technology and distributed ledger to protect your funds and data. You do
                not need to worry about fraud, hacking, or third-party interference.
                Your digital wallet and cryptocurrency are the only things you need to
                access and manage your account."
            />
        </section>
    )
}
