const mongoose = require('mongoose')
const MongoPaging = require('mongo-cursor-pagination')

const cardSchema = mongoose.Schema({
	id: {
		type: String,
		required: true,
		unique: true,
	},
	name: {
		type: String,
		required: true,
	},
	type: {
		type: String,
	},
	desc: {
		type: String,
	},
	atk: {
		type: Number,
	},
	def: {
		type: Number,
	},
	level: {
		type: Number,
	},
	race: {
		type: String,
	},
	attribute: {
		type: String,
	},
	archetype: {
		type: String,
	},
	card_sets: [
		{
			set_name: {
				type: String,
			},
			set_code: {
				type: String,
			},
			set_rarity: {
				type: String,
			},
			set_rarity_code: {
				type: String,
			},
			set_price: {
				type: Number,
			},
		},
	],
	card_images: [
		{
			id: {
				type: String,
			},
			image_url: {
				type: String,
			},
			image_url_small: {
				type: String,
			},
			image_url_croppped: {
				type: String,
			},
		},
	],
	card_prices: [
		{
			cardmarket_price: {
				type: Number,
			},
			tcgplayer_price: {
				type: Number,
			},
			ebay_price: {
				type: Number,
			},
			amazon_price: {
				type: Number,
			},
			coolstuffinc_price: {
				type: Number,
			},
		},
	],
})

cardSchema.plugin(MongoPaging.mongoosePlugin)

module.exports = mongoose.model('Card', cardSchema)
