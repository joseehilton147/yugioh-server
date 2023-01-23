const express = require('express')
const router = express.Router()

const Database = require('../data/models/database.model')

const config = require('../config/application.config')
const messages = require('../config/messages.config')

const axios = require('axios')
const moment = require('moment-timezone')

router.get('/version', async (request, response) => {
	try {
		const database = await Database.findOne()

		if (!database) {
			console.error('[GET] /database/version => no record found')

			response.status(500).send({ message: messages.random_error })
		} else {
			response.status(200).json(database)
		}
	} catch (error) {
		console.error('[GET] /database/version => ', error)

		response.status(500).send({ message: messages.random_error })
	}
})

router.post('/update', async (request, response) => {
	try {
		let database = await Database.findOne()

		const data = await axios.get(config.YGOPRODECK.API.DATABASE_VERSION).then(response => response.data[0])

		const version = {
			version: data.database_version,
			lastUpdateApi: moment(data.last_update, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'),
			lastUpdate: moment.tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss'),
		}

		if (!database) {
			database = await Database.create(version)
		} else {
			database = await Database.findOneAndUpdate({ _id: database._id }, version, { new: true })
		}

		response.status(200).json(database)
	} catch (error) {
		console.error('updateDatabase => ', error)

		response.status(500).send({ message: messages.random_error })
	}
})

module.exports = router
