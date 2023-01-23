const config = require('./config/application.config')
const http = require('./app')

// Start the server
http.listen(config.APP.PORT, () => {
	console.log(`Listening on port: ${config.APP.PORT}`)
})
