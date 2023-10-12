import React from "react"

export function InputErrorLabel(props) {
    const { msg, hidden } = props

    return hidden == undefined ? (
        ""
    ) : (
        <label className="label">
            <span className="label-text-alt from-error-content">{msg}</span>
        </label>
    )
}
