import { SchemaComposer } from "graphql-compose"

const schemaComposer = new SchemaComposer()
import { GamePlayAndOutcomeTC, UserTC, StatInfoTC } from "./models/index.js"

const LeaderBoardItemTC = schemaComposer.createObjectTC({
    name: "LeaderBoardItem",
    fields: {
        rank: "Int!",
        username: "String",
        address: "String",
        volume: "Int",
        grossProfit: "Int",
    },
    description: "list leader board entries",
})

schemaComposer.Query.addFields({
    // game play event and outcome events
    GamePlayAndOutcomeOne: GamePlayAndOutcomeTC.getResolver("findOne"),
    GamePlayAndOutcomeMany: GamePlayAndOutcomeTC.getResolver("findMany"),
    GamePlayAndOutcomeCount: GamePlayAndOutcomeTC.getResolver("count"),
    GamePlayAndOutcomePagination: GamePlayAndOutcomeTC.getResolver("pagination"),
    // user
    UserOne: UserTC.getResolver("findOne"),
    UserMany: UserTC.getResolver("findMany"),
    UserCount: UserTC.getResolver("count"),
    UserPagination: UserTC.getResolver("pagination"),
    // stat info
    StatInfoOne: StatInfoTC.getResolver("findOne"),
    StatInfoMany: StatInfoTC.getResolver("findMany"),
    StatInfoCount: StatInfoTC.getResolver("count"),
    StatInfoPagination: StatInfoTC.getResolver("pagination"),
    LeaderBoard: {
        type: [LeaderBoardItemTC],
        args: {
            util: "Int!",
            sortBy: "String!",
        },
        resolve: async (util, sortBy) => {
            console.log(util, sortBy)
            return [
                {
                    rank: 1,
                    username: "Gassa Yan",
                    address: "0x000",
                    volume: 30000,
                    grossProfit: 400000,
                },
            ]
        },
    },
})

schemaComposer.Mutation.addFields({
    // user
    createUser: UserTC.getResolver("createOne"),
    updateUserById: UserTC.getResolver("updateById"),
})

export const schema = schemaComposer.buildSchema()
