const mongoose = require('mongoose')

const databaseSchema = mongoose.Schema({
	version: {
		type: String,
		required: true,
	},
	lastUpdateApi: {
		type: String,
		required: true,
	},
	lastUpdate: {
		type: String,
		required: true,
	},
})

const Database = mongoose.model('Database', databaseSchema)

module.exports = Database
