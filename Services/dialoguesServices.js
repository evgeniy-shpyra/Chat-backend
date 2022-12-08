const s3 = require('../aws/index')
const pool = require('../db')
const tokenService = require('./tokenService')
const { getUserIdByDialogueId } = require('./userServices')

const creteDialogueQuery = `INSERT INTO dialogues (first_user_id, second_user_id, owner_user_id, date_of_creation) VALUES ($1, $2, $3, $4) RETURNING dialogue_id`

const selectDialoguesByUsersIdQuery = `SELECT dialogues.dialogue_id, users.user_id, users.username, users.email, images.path as image_path FROM dialogues 
    JOIN users ON users.user_id = dialogues.second_user_id
    LEFT JOIN images ON users.user_id = images.user_id
    WHERE (first_user_id=$1 AND second_user_id=$2) OR (second_user_id=$1 AND first_user_id=$2)`

const selectDialoguesByFirstUserIdQuery = `SELECT DISTINCT dialogues.dialogue_id, users.user_id, users.username, users.email, images.path as image_path,
    (CASE WHEN  messages.date IS NULL THEN dialogues.date_of_creation ELSE messages.date END) as date, messages.text
    FROM dialogues 
    JOIN users ON ((users.user_id = dialogues.second_user_id) AND (dialogues.second_user_id != $1)) 
    OR 
    ((users.user_id = dialogues.first_user_id) AND (dialogues.first_user_id != $1)) 
    LEFT JOIN images ON users.user_id = images.user_id
 	LEFT JOIN messages ON messages.date = (SELECT MAX(messages.date) FROM messages WHERE messages.dialogue_id = dialogues.dialogue_id)
    WHERE (first_user_id=$1 OR second_user_id=$1) AND users.username LIKE $2
	ORDER BY date DESC
	LIMIT $3 OFFSET $4`

const selectDialogueForNotOwnerUserByIdQuery = `SELECT dialogues.dialogue_id, users.user_id, users.username, users.email, images.path as image_path,
    dialogues.date_of_creation as date
    FROM dialogues 
    JOIN users ON dialogues.owner_user_id = users.user_id
    LEFT JOIN images ON users.user_id = images.user_id
    WHERE dialogues.dialogue_id = $1`

const selectDialoguesByIdQuery = `SELECT dialogues.dialogue_id, dialogues.date_of_creation as date, users.user_id, users.username, users.email, images.path as image_path FROM dialogues 
    JOIN users ON users.user_id = dialogues.second_user_id
    LEFT JOIN images ON users.user_id = images.user_id
    WHERE dialogues.dialogue_id = $1`

const selectUserByIdQuery =
    'SELECT user_id as id, username, email, password FROM users WHERE user_id=$1'

const deleteDialogueById =
    'DELETE FROM dialogues WHERE dialogue_id = $1 RETURNING dialogue_id'

class DialoguesService {
    async addDialogue(ownerId, secondUserId) {
        const ownerUser = await pool
            .query(selectUserByIdQuery, [ownerId])
            .then((res) => res.rows[0])

        if (!ownerUser) {
            throw Error(`The user with id ${ownerId} isn't exists`)
        }

        const secondUser = await pool
            .query(selectUserByIdQuery, [secondUserId])
            .then((res) => res.rows[0])

        if (!secondUser) {
            throw Error(`The user with id ${secondUserId} isn't exists`)
        }

        const createdDialogue = await pool
            .query(selectDialoguesByUsersIdQuery, [ownerId, secondUserId])
            .then((res) => res.rows)

        if (createdDialogue.length > 0) throw Error(`Dialogues already created`)

        const dialogueId = await pool
            .query(creteDialogueQuery, [
                ownerId,
                secondUserId,
                ownerId,
                new Date(),
            ])
            .then((res) => res.rows[0].dialogue_id)

        const dialogue = await this.getDialogueById(dialogueId)

        return dialogue
    }

    async getDialogues(ownerId, searchingValue, page) {
        const limit = 20

        let offset = page ? page * limit : 0

        const partOfUsername = searchingValue ? searchingValue + '%' : '%'

        if (!ownerId) {
            throw Error(`Occurred error`)
        }
        const ownerUser = await pool
            .query(selectUserByIdQuery, [ownerId])
            .then((res) => res.rows[0])

        if (!ownerUser) {
            throw Error(`The user with id ${ownerId} isn't exists`)
        }

        const dialogues = await pool
            .query(selectDialoguesByFirstUserIdQuery, [
                ownerId,
                partOfUsername,
                limit,
                offset,
            ])
            .then((res) => res.rows)

        return dialogues
    }

    async getDialogueById(dialogueId) {
        const dialogue = await pool
            .query(selectDialoguesByIdQuery, [dialogueId])
            .then((res) => res.rows[0])
        return dialogue
    }

    async deleteDialogue(firstUserId, dialogueId) {
        const interlocutorId = await getUserIdByDialogueId(
            firstUserId,
            dialogueId
        )
    
        await pool.query(deleteDialogueById, [dialogueId])
        return interlocutorId
    }

    async getDialogueForNotOwner(dialogueId) {
        const user = await pool
            .query(selectDialogueForNotOwnerUserByIdQuery, [dialogueId])
            .then((res) => res.rows[0])
        return user
    }
}

module.exports = new DialoguesService()
