const express = require('express')
const app = express()

const config = require('./config/application.config')
const messages = require('./config/messages.config')

const CardsController = require('./routes/cards.route')
const DatabaseController = require('./routes/database.route')
const ImagesController = require('./routes/images.route')

const mongoose = require('mongoose')
const helmet = require('helmet')
const cors = require('cors')

mongoose.connect(config.MONGO.URL, config.MONGO.CONFIG, error => {
	if (error) {
		console.error('mongoDB connection error: ', error)
		process.exit()
	}

	console.log('MongoDB connected with success.')
})

// API Security (https://helmetjs.github.io)
app.use(helmet())

// CORS
app.use(
	cors({
		credentials: true,
		origin: config.APP.IS_DEV ? true : config.APP.CLIENT_URL,
	})
)

// https://stackoverflow.com/questions/23413401/what-does-trust-proxy-actually-do-in-express-js-and-do-i-need-to-use-it
app.set('trust proxy', true)

// Load the json module to parse POST and PUT request and increase the limit of the body
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Load all the controllers
app.use('/cards', CardsController)
app.use('/database', DatabaseController)
app.use('/images', ImagesController)

const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Handle 404 request
app.use((request, response) => {
	response.status(404).send({ message: messages.not_found })
})

module.exports = app
