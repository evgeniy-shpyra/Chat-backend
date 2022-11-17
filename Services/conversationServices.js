const s3 = require('../aws/index')
const pool = require('../db')
const tokenService = require('./tokenService')

const selectMessagesByDialogueId = `SELECT messages.message_id as id, messages.owner_user_id, messages.text, messages.date FROM messages WHERE dialogue_id = $1 ORDER BY date`
const selectUserByIdQuery =
    'SELECT user_id as id, username, email, password FROM users WHERE user_id=$1'
const insertMessageQuery = `INSERT INTO messages (dialogue_id, text, date, owner_user_id) VALUES
    ($1, $2, $3, $4) RETURNING message_id, text, date, owner_user_id`

class conversationServices {
    async getConversation(dialogueId) {

        const conversation = await pool
            .query(selectMessagesByDialogueId, [dialogueId])
            .then((res) => res.rows)

        return conversation
    }

    async addMessage(text, dialogueId, ownerUserId) {
        const message = await pool
            .query(insertMessageQuery, [
                dialogueId,
                text,
                new Date(),
                ownerUserId,
            ])
            .then((res) => res.rows[0])

        // var options = { hour12: false }

        // const date = message.date.toLocaleDateString('en-US', options).split('/').join('.')
        // const time = message.date.toLocaleTimeString('en-US', options)

        return message
    }
}

module.exports = new conversationServices()
