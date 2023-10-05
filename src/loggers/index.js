const {createLogger,transports} = require('winston')
const {WinstonChannelLogger} = require('@kevit/winston-channel-logger')

const winstonChannelLogger = new WinstonChannelLogger({ 
    level:'silly',
    platforms: [{
      platformName: 'ms-teams',
      webhookUrl: process.env.TEAMS_WEBHOOK_URL,
   }]
})

const logger = createLogger({
    transports: [new transports.Console({  level:'silly'}), winstonChannelLogger],
  });

module.exports = logger