"use client"
import React, { useState } from "react"
import { useFormContext } from "react-hook-form"

import utils from "../../utils"
import { InputErrorLabel } from "../InputErrorLabel"

export function DiceRangeInputsForm(props) {
    const methods = useFormContext()
    const [range, setRange] = useState(50.0)

    const validateMultiplier = (m) => {
        const rm = utils.toRawMultiplier(m)
        return rm >= utils.Min_Multiplier && rm <= utils.Max_Multiplier
    }

    const validateWinChance = (w) => {
        const rw = utils.toRawWinChance(w)
        return rw >= utils.Min_WinChance && rw <= utils.Max_WinChance
    }

    const handleChanges = (e) => {
        if (e.target.id == "diceRange" || e.target.id == "rollOver") {
            const { winChance: rw, multiplier: rm } = utils.handleRangeChange(
                utils.toRawRangeNumber(methods.getValues("diceRange")),
                methods.getValues("rollOver")
            )
            setRange(methods.getValues("diceRange"))
            methods.setValue("multiplier", utils.formatRawMultiplier(rm))
            methods.setValue("winChance", utils.formatRawWinChance(rw))
        }
        if (e.target.id == "multiplier") {
            const { rangeNumber: rn, winChance: rw } = utils.handleMultiplierChange(
                utils.toRawMultiplier(methods.getValues("multiplier")),
                methods.getValues("rollOver")
            )
            setRange(utils.formatRangeNumber(rn))
            methods.setValue("diceRange", utils.formatRangeNumber(rn))
            methods.setValue("winChance", utils.formatRawWinChance(rw))
        }
        if (e.target.id == "winChance") {
            const { rangeNumber: rn, multiplier: rm } = utils.handleWinChanceChange(
                utils.toRawWinChance(methods.getValues("winChance")),
                methods.getValues("rollOver")
            )
            setRange(utils.formatRangeNumber(rn))
            methods.setValue("diceRange", utils.formatRangeNumber(rn))
            methods.setValue("multiplier", utils.formatRawMultiplier(rm))
        }
    }

    return (
        <div className="w-2/3">
            <div className="section-1">
                <div className="flex flex-row justify-center py-16">
                    <img src="/images/dice-1.png" />
                    <img src="/images/dice-2.png" />
                </div>
                <div className="flex flex-row justify-center">
                    <label className="label font-mono text-6xl" htmlFor="diceRange">
                        {range}
                    </label>
                </div>
                <div className="form-control w-full">
                    {methods.getValues("rollOver") ? (
                        <input
                            id="diceRange"
                            type="range"
                            min={5}
                            max={99.9}
                            step={0.1}
                            className="range"
                            {...methods.register("diceRange", {
                                onChange: (e) => handleChanges(e),
                            })}
                        />
                    ) : (
                        <input
                            id="diceRange"
                            type="range"
                            min={0.1}
                            max={95}
                            step={0.1}
                            className="range"
                            {...methods.register("diceRange", {
                                onChange: (e) => handleChanges(e),
                            })}
                        />
                    )}
                </div>
            </div>
            {/* end of section-1 */}
            <div className="section-2 flex flex-row bg-base-100 my-4 p-4 rounded-lg justify-between gap-4">
                <div className="w-1/3 flex flex-col items-center">
                    <label className="label cursor-pointer justify-center" htmlFor="rollOver">
                        <span className="label-text">
                            {methods.getValues("rollOver") ? "Roll Over" : "Roll Under"}
                        </span>
                    </label>
                    <input
                        id="rollOver"
                        type="checkbox"
                        className="toggle"
                        defaultChecked={methods.getValues("rollOver")}
                        {...methods.register("rollOver", {
                            onChange: (e) => handleChanges(e),
                        })}
                    />
                </div>
                <div className="win-chance-group">
                    <label className="label" htmlFor="winChance">
                        <span className="label-text">
                            Win Chance <b> (%) </b>
                        </span>
                    </label>
                    <div className="join w-full">
                        <input
                            id="winChance"
                            type="text"
                            className={`input input-bordered w-full winChance ${
                                methods.formState.errors.winChance ? "input-error" : ""
                            }`}
                            {...methods.register("winChance", {
                                onChange: (e) => handleChanges(e),
                                validate: (w) => validateWinChance(w),
                            })}
                        />
                    </div>
                    <InputErrorLabel
                        hidden={methods.formState.errors.winChance}
                        msg="must between 0.1 and 95"
                    />
                </div>
                <div className="multiplier-group">
                    <label className="label" htmlFor="multiplier">
                        <span className="label-text">
                            Multiplier <b>(times)</b>
                        </span>
                    </label>
                    <div className="join w-full">
                        <input
                            id="multiplier"
                            type="text"
                            className={`input input-bordered w-full multiplier ${
                                methods.formState.errors.multiplier ? "input-error" : ""
                            }`}
                            {...methods.register("multiplier", {
                                onChange: (e) => handleChanges(e),
                                validate: (m) => validateMultiplier(m),
                            })}
                        />
                    </div>
                    <InputErrorLabel
                        hidden={methods.formState.errors.multiplier}
                        msg="must between 1.0421 and 990.0"
                    />
                </div>
            </div>
            {/* end of section-2 */}
        </div>
    )
}
