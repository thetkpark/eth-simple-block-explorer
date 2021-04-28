import fastify from './app'
import dotenv from 'dotenv'
dotenv.config()

const port = process.env.PORT || 3050

const start = async () => {
	try {
		await fastify.listen(port)
		console.log(`Listening on port ${port}`)
	} catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}
}

start()
