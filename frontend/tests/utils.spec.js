import _ from "lodash"
import utils from "../utils/index"

describe("Units Tests", function () {
    describe("Dice Input Arguments", () => {
        it("should handle range number changes", () => {
            const inputsOver = [500000, 5000000, 9500000, 9900000, 9990000]
            const inputsUnder = [10000, 100000, 500000, 5000000, 9500000]
            const rstOver = _.map(inputsOver, (x) => utils.handleRangeChange(x, true))
            const rstUnder = _.map(inputsUnder, (x) => utils.handleRangeChange(x, false))
            const expected = [
                { winChance: 9500000, multiplier: 10421 },
                { winChance: 5000000, multiplier: 19800 },
                { winChance: 500000, multiplier: 198000 },
                { winChance: 100000, multiplier: 990000 },
                { winChance: 10000, multiplier: 9900000 },
            ]
            expect(rstOver).toEqual(expect.arrayContaining(expected))
            expect(rstUnder).toEqual(expect.arrayContaining(expected))
        })
        it("should handle multiplier changes", () => {
            const inputs = [10421, 19800, 198000, 990000, 9900000]
            const rstOver = _.map(inputs, (m) => utils.handleMultiplierChange(m, true))
            const rstUnder = _.map(inputs, (m) => utils.handleMultiplierChange(m, false))
            const expectedOver = [
                { rangeNumber: 499953, winChance: 9500047 },
                { rangeNumber: 5000000, winChance: 5000000 },
                { rangeNumber: 9500000, winChance: 500000 },
                { rangeNumber: 9900000, winChance: 100000 },
                { rangeNumber: 9990000, winChance: 10000 },
            ]
            const expectedUnder = [
                { rangeNumber: 9500047, winChance: 9500047 },
                { rangeNumber: 5000000, winChance: 5000000 },
                { rangeNumber: 500000, winChance: 500000 },
                { rangeNumber: 100000, winChance: 100000 },
                { rangeNumber: 10000, winChance: 10000 },
            ]
            expect(rstOver).toEqual(expect.arrayContaining(expectedOver))
            expect(rstUnder).toEqual(expect.arrayContaining(expectedUnder))
        })
        it("should handle win chance changes", () => {
            const inputs = [9500000, 5000000, 500000, 100000, 10000]
            const rstOver = _.map(inputs, (w) => utils.handleWinChanceChange(w, true))
            const rstUnder = _.map(inputs, (w) => utils.handleWinChanceChange(w, false))
            const expectedOver = [
                { rangeNumber: 500000, multiplier: 10421 },
                { rangeNumber: 5000000, multiplier: 19800 },
                { rangeNumber: 9500000, multiplier: 198000 },
                { rangeNumber: 9900000, multiplier: 990000 },
                { rangeNumber: 9990000, multiplier: 9900000 },
            ]
            const expectedUnder = [
                { rangeNumber: 9500000, multiplier: 10421 },
                { rangeNumber: 5000000, multiplier: 19800 },
                { rangeNumber: 500000, multiplier: 198000 },
                { rangeNumber: 100000, multiplier: 990000 },
                { rangeNumber: 10000, multiplier: 9900000 },
            ]
            expect(rstOver).toEqual(expect.arrayContaining(expectedOver))
            expect(rstUnder).toEqual(expect.arrayContaining(expectedUnder))
        })

        it("should format raw multiplier", () => {
            const rawMultipliers = [10421, 19800, 198000, 990000, 9900000]
            const formattedMultipliers = _.map(rawMultipliers, (m) => utils.formatRawMultiplier(m))
            const expected = ["1.0421", "1.9800", "19.8000", "99.0000", "990.0000"]
            expect(formattedMultipliers).toEqual(expect.arrayContaining(expected))
        })

        it("should convert between raw win chance and formatted win chance", () => {
            const rw = [9500000, 5000000, 500000, 100000, 10000]
            const rstFw = _.map(rw, (w) => utils.formatRawWinChance(w))
            const fw = ["95.00", "50.00", "5.00", "1.00", "0.10"]
            expect(rstFw).toEqual(expect.arrayContaining(fw))
            const rstRw = _.map(fw, (w) => utils.toRawWinChance(w))
            expect(rstRw).toEqual(expect.arrayContaining(rw))
        })

        it("should convert between raw multiplier and formatted multiplier", () => {
            const rawMultipliers = [10421, 19800, 198000, 990000, 9900000]
            const formattedMultipliers = _.map(rawMultipliers, (m) => utils.formatRawMultiplier(m))
            const formatted = ["1.0421", "1.9800", "19.8000", "99.0000", "990.0000"]
            expect(formattedMultipliers).toEqual(expect.arrayContaining(formatted))
            const rm = _.map(formatted, (m) => utils.toRawMultiplier(m))
            expect(rm).toEqual(expect.arrayContaining(rawMultipliers))
        })

        it("should convert between raw range number and formatted range number", () => {
            const rn = [499953, 500000, 5000000, 9500047, 9500000, 9900000, 9990000]
            const rstFn = _.map(rn, (n) => utils.formatRangeNumber(n))
            const fn = ["5.0", "5.0", "50.0", "95.0", "95.0", "99.0", "99.9"]
            expect(rstFn).toEqual(expect.arrayContaining(fn))
            const rstRn = _.map(fn, (n) => utils.toRawRangeNumber(n))
            expect(rstRn).toEqual(expect.arrayContaining(rstRn))
        })
    })
})
