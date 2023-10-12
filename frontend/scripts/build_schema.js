
import fs from 'fs-extra'
import path from 'path'
import { graphql } from 'graphql'
import { printSchema, getIntrospectionQuery } from 'graphql'
import { schema } from '../database/schema.js'
import './connection.mjs'

const __dirname = path.resolve(path.dirname(''))

async function buildSchema() {
	await fs.ensureFile('./generated_files/schema.graphql.json')
	await fs.ensureFile('./generated_files/schema.graphql')

	try {
	  fs.writeFileSync(
		  path.join(__dirname, './generated_files/schema.graphql.json'),
		  JSON.stringify(await graphql({ schema: schema, source: getIntrospectionQuery() }), null, 2)
	  )

		fs.writeFileSync(
			path.join(__dirname, './generated_files/schema.graphql'),
			printSchema(schema)
		)
	} catch(e) {
		console.log(e)
	}

}

async function run() {
	const schemaObject = printSchema(schema);
	console.log(schema);
	await buildSchema();
	console.log('Schema build complete!');
}

run().catch(e => {
	console.log(e);
	process.exit(0);
});