const mongoose = require('mongoose')
const MongoPaging = require('mongo-cursor-pagination')

const imageSchema = mongoose.Schema({
	id: {
		type: String,
		required: true,
	},
	cardName: {
		type: String,
	},
	folderName: {
		type: String,
	},
	status: {
		type: String,
	},
	fileId: {
		type: String,
	},
	size: {
		type: Number,
	},
	versionInfo: {
		id: {
			type: String,
		},
		name: {
			type: String,
		},
	},
	filePath: {
		type: String,
	},
	url: {
		type: String,
	},
	fileType: {
		type: String,
	},
	height: {
		type: Number,
	},
	width: {
		type: Number,
	},
	thumbnailUrl: {
		type: String,
	},
})

imageSchema.plugin(MongoPaging.mongoosePlugin)

module.exports = mongoose.model('Image', imageSchema)
