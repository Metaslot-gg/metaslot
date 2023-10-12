import React from "react"
export function Footer(props) {
    return (
        // footer p-10 bg-neutral justify-center text-neutral-content
        <footer>
            <div className="max-w-6xl mx-auto bg-neutral text-neutral-content items-center">
                <div className="lg:flex lg:justify-between h-16 items-center">
                    <div className="md:grow mb-8 lg:mb-0 text-center">
                        <p>© 2023 MetaSlot. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
