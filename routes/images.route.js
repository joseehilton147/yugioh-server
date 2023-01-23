const express = require('express')
const router = express.Router()

const Card = require('../data/models/card.model')
const Image = require('../data/models/image.model')

const config = require('../config/application.config')
const messages = require('../config/messages.config')

const imageKit = require('imagekit')
const cheerio = require('cheerio')
const axios = require('axios')
const probe = require('probe-image-size')

router.get('/no-artwork', async (request, response) => {
	try {
		const cards = await Image.find({ status: 'error' })

		response.status(200).json(cards)
	} catch (error) {
		console.error(error)

		response.status(500).send({ message: messages.random_error })
	}
})

router.post('/artwork/sync/yugipedia', async (request, response) => {
	try {
		const cards = await Image.find({ status: 'error' })

		let artworkImagesWiki = []

		for (const [index, card] of cards.entries()) {
			const cardName = card.cardName.replace(/ /g, '_')

			try {
				const cardGalleryPage = await axios
					.get(`https://yugipedia.com/wiki/Card_Gallery:${cardName}`)
					.then(res => res.data)

				const $ = cheerio.load(cardGalleryPage.data)

				$('a').each((index, element) => {
					const urlElement = $(element).attr('href')

					if (urlElement && urlElement.includes('artwork')) {
						artworkImagesWiki.push({ url: urlElement })
					}
				})
			} catch (error) {
				console.error(
					`Image ${index} of ${cards.length} => this card doesnt have a gallery page.\nCard name: ${card.cardName}.\n`
				)
			}

			let artworkImages = []
			// for (const image of artworkImagesWiki) {
			// 	const galleryImage = await axios.get(`https://yugipedia.com${image.url}`)

			// 	const $ = cheerio.load(galleryImage.data)

			// 	$('img').each((index, element) => {
			// 		const urlElement = $(element).attr('src')

			// 		if (urlElement && urlElement.includes('artwork')) {
			// 			artworkImages.push({ url: urlElement })
			// 		}
			// 	})
			// }
			// for (const image of artworkImages) {
			// 	const imageResult = await probe(image.url)
			// 	image.width = imageResult.width
			// 	image.height = imageResult.height
			// }
			// let artworkImage = artworkImages.reduce((prev, current) =>
			// 	prev.height > current.height ? prev : current
			// ).url

			// await Image.findOneAndUpdate(
			// 	{ id: card.id },
			// 	{
			// 		$set: {
			// 			url: artworkImage,
			// 		},
			// 	}
			// )
		}

		response.status(200).json(artworkImagesWiki)
	} catch (error) {
		console.error(error)

		response.status(500).send({ message: messages.random_error })
	}
})

router.get('/artwork/:cardName/yugipedia', async (request, response) => {
	try {
		const cardName = request.params.cardName.replace(/ /g, '_')
		const cardGalleryPage = await axios.get(`https://yugipedia.com/wiki/Card_Gallery:${cardName}`)

		const $ = cheerio.load(cardGalleryPage.data)

		let artworkImagesWiki = []

		$('a').each((index, element) => {
			const urlElement = $(element).attr('href')

			if (urlElement && urlElement.includes('artwork')) {
				artworkImagesWiki.push({ url: urlElement })
			}
		})

		let artworkImages = []

		for (const image of artworkImagesWiki) {
			const imagePage = await axios.get(`https://yugipedia.com${image.url}`)

			const $ = cheerio.load(imagePage.data)

			const imageSrc = $('div.fullImageLink').find('img').attr('src')

			artworkImages.push({ url: imageSrc })
		}

		for (const image of artworkImages) {
			const imageResult = await probe(image.url)

			image.width = imageResult.width
			image.height = imageResult.height
		}

		let artworkImage = artworkImages.reduce((prev, current) => (prev.height > current.height ? prev : current)).url

		response.status(200).json(artworkImage)
	} catch (error) {
		console.error(error)

		response.status(500).send({ message: messages.random_error })
	}
})

router.get('/no-artwork/:name', async (request, response) => {
	try {
		const image = await Image.findOne({
			cardName: request.params.name,
		})

		if (!image) {
			return response.status(404).json({
				message: messages.image_not_found,
			})
		}

		response.status(200).json(image)
	} catch (error) {
		console.error(error)

		response.status(500).send({ message: messages.random_error })
	}
})

router.post('/upload', async (request, response) => {
	try {
		const cards = await Card.find().select('id name card_images.image_url_croppped')

		for (const [index, card] of cards.entries()) {
			const imageAlreadyExists = await Image.exists({ id: card.id })

			if (!imageAlreadyExists) {
				const cardImage = card.card_images[0].image_url_croppped

				try {
					const imageKitInstance = new imageKit(config.IMAGE_KIT)

					const response = await imageKitInstance.upload({
						file: cardImage,
						fileName: card.id,
						folder: 'cropped',
					})

					await Image.create({
						id: card.id,
						folderName: 'cropped',
						cardName: card.name,
						status: 'success',
						fileId: response.fileId,
						size: response.size,
						versionInfo: response.versionInfo,
						filePath: response.filePath,
						url: response.url,
						fileType: response.fileType,
						height: response.height,
						width: response.width,
						thumbnailUrl: response.thumbnailUrl,
					})

					console.log(`Image ${index} of ${cards.length} => saved on ImageKit.\nCard name: ${card.name}.\n`)
				} catch (error) {
					await Image.create({
						id: card.id,
						cardName: card.name,
						folderName: 'cropped',
						status: 'error',
					})

					console.error(`Image ${index} of ${cards.length} => ${error.message}.\nCard name: ${card.name}.\n`)
				}
			} else {
				console.log(
					`Image ${index} of ${cards.length} => Already have a record on database.\nCard name: ${card.name}.\n`
				)
			}
		}

		response.sendStatus(200)
	} catch (error) {
		console.error('error => ', error)

		response.status(500).send({ message: messages.random_error })
	}
})

module.exports = router
