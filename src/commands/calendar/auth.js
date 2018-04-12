'use strict'

const { Command } = require('sylphy')

const Guild = require('../../lib/guild')

class AuthCalendar extends Command {
  constructor (...args) {
    super(...args, {
      name: 'calauth',
      group: 'calendar',
      description: 'Authorize bot to access your calendars',
      options: {
        guildOnly: true,
        hidden: false
      }
    })
  }

  async handle ({ msg, client }, responder) {
    let guildId = msg.channel.guild.id

    let a = new Guild(guildId, client)
    let b = a.authToken

    return client.db.collection('guilds').findOne({ guildId })
      .then(guildData => {
        if (guildData && guildData.authToken) {
          return responder.selection(['Yes', 'No'], {
            title: 'Are you sure you want to change the auth ticket?'
          })
            .then(selection => {
              if (selection === 'Yes') {
                return client.gcal.getAuthClient()
              } else {
                return Promise.reject({code: 2, msg: 'cancelled'})
              }
            })
        }
        return client.gcal.getAuthClient()
      })
      .then(authClient => client.gcal.getAuthUrl(authClient)
        .then(authUrl => responder.dialog([
          {
            prompt: `Authorize the bot by visiting this url: \n\n ${authUrl} \n\n Respond with the code from that page`,
            input: { name: 'response', type: 'string', bot: false }
          }])
        )
        .then(({response: code}) => client.gcal.getTokenFromCode(authClient, code))
      )
      .then(token => responder.send(token))
  }
}

module.exports = AuthCalendar
