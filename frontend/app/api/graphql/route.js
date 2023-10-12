import { schema } from "../../../database/schema"
import dbConnect from "../../../database/db"
import { startServerAndCreateNextHandler } from "@as-integrations/next"
import { ApolloServer } from "@apollo/server"

const server = new ApolloServer({ schema: schema })

const handler = startServerAndCreateNextHandler(server)

export async function GET(request) {
    await dbConnect()
    return handler(request)
}

export async function POST(request) {
    console.log("graphql here, post")
    await dbConnect()
    console.log("db connected")
    return handler(request)
}
