'use strict'

// const gitRevSync = require('git-rev-sync')
const R = require('ramda')
const raven = require('raven')

// const gitRevisionId = gitRevSync.long()

class Sentry extends raven.Client {
  constructor (bot, config) {
    // this.bot = bot
    // this.config = bot.config

    let dsn = process.env.SENTRY_DSN || config.sentry.dsn || ''

    let hasClient = true
    // let isEnabled = true

    if (dsn === '') {
      bot.logger.warn('No Sentry DSN provided. Error logging will be terrible.')
      // isEnabled = false
      hasClient = false
    }

    if (hasClient) {
      let sentryOpts = config.sentry.options || {}

      let env = process.env.NODE_ENV || process.env.SENTRY_ENVIRONMENT || config.env || 'development'

      bot.logger.debug(`Running in a ${env} environment`)

      let defOptions = {
        environment: env,
        release: config.version,
        transport: new raven.transports.HTTPSTransport({rejectUnauthorized: false})
      }

      sentryOpts = R.merge(defOptions, sentryOpts)

      bot.logger.debug('Creating sentry client (Raven)...')

      super(dsn, sentryOpts)

      bot.logger.debug('Setting Raven handlers...')

      this.install()
    } else {
      super(null)
    }

    this.hasClient = hasClient
    this.isEnabled = hasClient
    this.bot = bot
    this.config = config
  }

  getEnabled () {
    return (this.hasClient && this.isEnabled)
  }

  setEnabled (enabled) {
    this.isEnabled = (enabled && this.hasClient)
  }
}

module.exports = Sentry
