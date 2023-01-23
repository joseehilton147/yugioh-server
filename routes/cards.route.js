const express = require('express')
const router = express.Router()

const Card = require('../data/models/card.model')
const Image = require('../data/models/image.model')

const config = require('../config/application.config')
const messages = require('../config/messages.config')

const axios = require('axios')
const imageKit = require('imagekit')

router.get('/', async (request, response) => {
	try {
		const next = request.query.next || ''
		const previous = request.query.previous || ''

		let cards = await Card.paginate({
			sortAscending: true,
			limit: parseInt(request.query.limit) || 10,
			next,
			previous,
		})

		await Promise.all(
			cards.results.map(async card => {
				const cardImage = await Image.find({
					id: card.id,
				})

				card.card_images[0].image_url_croppped = cardImage.length ? cardImage[0].url : config.APP.NO_ARTWORK

				return card
			})
		)

		response.status(200).json(cards)
	} catch (error) {
		console.error('getCards => ', error)

		response.status(500).send({ message: messages.random_error })
	}
})

router.get('/search/:value', async (request, response) => {
	try {
		const value = request.params.value
		let cards = await Card.find({ $or: [{ id: value }, { name: value }] })

		if (!cards.length) {
			return response.status(404).json({
				message: messages.card_not_found,
			})
		}

		await Promise.all(
			cards.map(async card => {
				const cardImage = await Image.find({
					id: card.id,
				})

				card.card_images[0].image_url_croppped = cardImage.length ? cardImage[0].url : config.APP.NO_ARTWORK

				return card
			})
		)

		response.status(200).json(cards)
	} catch (error) {
		console.error('getCard => ', error)

		response.status(500).send({ message: messages.random_error })
	}
})

router.post('/sync', async (request, response) => {
	try {
		const cards = await axios.get(config.YGOPRODECK.API.CARDS).then(response => response.data.data)

		for (let index = 0; index < cards.length; index++) {
			let card = cards[index]
			const cardAlreadyExists = await Card.exists({ id: card.id })

			if (!cardAlreadyExists) {
				try {
					card = await axios
						.get(`${config.YGOPRODECK.API.CARDS}?id=${card.id}`)
						.then(response => response.data.data[0])
				} catch (error) {
					console.error(`Card ${index} of ${cards.length} => ${error.message}.\nCard name: ${card.name}\n`)
				}

				await Card.create(card)

				console.log(`Card ${index} of ${cards.length} => saved on database.\nCard name: ${card.name}\n`)
			} else {
				console.log(
					`Card ${index} of ${cards.length} => Already have a record on database.\nCard name: ${card.name}\n`
				)
			}
		}

		response.sendStatus(200)
	} catch (error) {
		console.error(`SYNC error => ${error}`)

		response.status(500).send({ message: messages.random_error })
	}
})

router.delete('/:id', async (request, response) => {
	try {
		const imageKitInstance = new imageKit(config.IMAGE_KIT)
		const card = await Card.findOne({ id: request.params.id })

		if (!card) {
			return response.status(404).json({
				message: messages.not_found,
			})
		}

		const cardImage = await Image.find({
			id: request.params.id,
		})

		await imageKitInstance.deleteFile(cardImage.fileId)
		await Image.deleteOne({ id: request.params.id })

		await Card.deleteOne({ id: request.params.id })

		response.sendStatus(200)
	} catch (error) {
		console.error('deleteCard => ', error)

		response.status(500).send({ message: messages.random_error })
	}
})

module.exports = router
