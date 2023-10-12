import "./database/db.js"
import { schema } from "./database/schema.js"
import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"

async function run() {
    const server = new ApolloServer({ schema: schema })
    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000 },
    })
    console.log(`start apollo server at port ${url}`)
}

run().catch((e) => {
    console.log(e)
    process.exit(0)
})
