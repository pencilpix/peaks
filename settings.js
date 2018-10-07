const { readFileSync } = require('fs')
const { resolve } = require('path')
const dotenv = require('dotenv')
const env = dotenv.parse(readFileSync(resolve(__dirname, './.env')))


module.exports = {
  appUrl: env.APP_URL,
}

