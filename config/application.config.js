require('dotenv').config()

const defaultConfig = {
	APP: {
		PORT: process.env.SERVER_PORT,
		CLIENT_URL: process.env.CLIENT_URL,
		IS_DEV: process.env.NODE_ENV !== 'production',
		NO_ARTWORK: process.env.NO_ARTKWORK,
	},
	MONGO: {
		URL: process.env.MONGO_DB,
	},
	IMAGE_KIT: {
		id: process.env.ID,
		publicKey: process.env.PUBLIC_KEY,
		privateKey: process.env.PRIVATE_KEY,
		urlEndpoint: process.env.URL_ENDPOINT,
	},
	YGOPRODECK: {
		API: {
			DATABASE_VERSION: 'https://db.ygoprodeck.com/api/v7/checkDBVer.php',
			CARDS: 'https://db.ygoprodeck.com/api/v7/cardinfo.php',
		},
	},
}

module.exports = defaultConfig
