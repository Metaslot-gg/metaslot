import React from "react"

export function StatBox() {
    return (
        <section className="flex">
            <div className="flex flex-row game-stat stats stats-horizontal w-full shadow py-8">
                <div className="stat place-items-center basis-1/3">
                    <div className="stat-title text-center">Total Wagered</div>
                    <div className="stat-value text-center">$100,000,000</div>
                </div>

                <div className="stat place-items-center basis-1/3">
                    <div className="stat-title text-center">Total Bets</div>
                    <div className="stat-value text-center text-secondary">$100,000,000</div>
                </div>
                <div className="stat place-items-center basis-1/3">
                    <div className="stat-title text-center">Total User</div>
                    <div className="stat-value text-center">10,000</div>
                </div>
            </div>
        </section>
    )
}
