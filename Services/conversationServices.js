const pool = require('../db')

const selectMessagesByDialogueId = `SELECT messages.message_id as id, messages.owner_user_id, messages.text, messages.date FROM messages WHERE dialogue_id = $1 ORDER BY date`
// const selectUserByIdQuery =
//     'SELECT user_id as id, username, email, password FROM users WHERE user_id=$1'
const insertMessageQuery = `INSERT INTO messages (dialogue_id, text, date, owner_user_id) VALUES
    ($1, $2, $3, $4) RETURNING message_id, text, date, owner_user_id`
const deleteMessagesByDialogueId = `DELETE FROM messages WHERE dialogue_id = $1`
const selectDialoguesByDialogueId = `SELECT * FROM dialogues WHERE dialogue_id = $1`

class conversationServices {
    async getConversation(dialogueId) {
        const dialogue = await pool
            .query(selectDialoguesByDialogueId, [dialogueId])
            .then((res) => res.rows)

        if (dialogue.length === 0) throw new Error("Dialogue isn't exist")

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
        return message
    }

    async clearHistory(dialogueId) {
        await pool.query(deleteMessagesByDialogueId, [dialogueId])
        return dialogueId 
    }
}

module.exports = new conversationServices()
 