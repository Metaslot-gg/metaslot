import { SchemaComposer } from "graphql-compose"

const schemaComposer = new SchemaComposer()
import { GamePlayAndOutcomeTC, UserTC, StatInfoTC } from "./models/index.js"

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
})

schemaComposer.Mutation.addFields({
    // user
    createUser: UserTC.getResolver("createOne"),
    updateUserById: UserTC.getResolver("updateById"),
})

export const schema = schemaComposer.buildSchema()
