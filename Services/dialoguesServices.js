const s3 = require('../aws/index')
const pool = require('../db')
const tokenService = require('./tokenService')

const creteDialogueQuery = `INSERT INTO dialogues (first_user_id, second_user_id, owner_user_id) VALUES ($1, $2, $3) RETURNING dialogue_id`
const selectDialoguesByOwnerIdQuery = `SELECT dialogues.dialogue_id, users.user_id, users.username, users.email, images.path as image_path FROM dialogues 
    JOIN usersON ((users.user_id = dialogues.second_user_id) AND (dialogues.second_user_id != $1)) 
    OR 
    ((users.user_id = dialogues.first_user_id) AND (dialogues.first_user_id != $1)) 
    LEFT JOIN images ON users.user_id = images.user_id
    WHERE owner_user_id=$1
    ORDER BY dialogues.dialogue_id DESC`

const selectDialoguesByUsersIdQuery = `SELECT dialogues.dialogue_id, users.user_id, users.username, users.email, images.path as image_path FROM dialogues 
    JOIN users ON users.user_id = dialogues.second_user_id
    LEFT JOIN images ON users.user_id = images.user_id
    WHERE (first_user_id=$1 AND second_user_id=$2) OR (second_user_id=$1 AND first_user_id=$2)`

const selectDialoguesByFirstUserIdQuery = `SELECT dialogues.dialogue_id, users.user_id, users.username, users.email, images.path as image_path FROM dialogues 
    JOIN users ON ((users.user_id = dialogues.second_user_id) AND (dialogues.second_user_id != $1)) 
    OR 
    ((users.user_id = dialogues.first_user_id) AND (dialogues.first_user_id != $1)) 
    LEFT JOIN images ON users.user_id = images.user_id
    WHERE (first_user_id=$1 OR second_user_id=$1)`

const selectDialogueForNotOwnerUserByIdQuery = `SELECT dialogues.dialogue_id, users.user_id, users.username, users.email, images.path as image_path FROM dialogues 
    JOIN users ON dialogues.owner_user_id = users.user_id
    LEFT JOIN images ON users.user_id = images.user_id
    WHERE dialogues.dialogue_id = $1`

const selectDialoguesByIdQuery = `SELECT dialogues.dialogue_id, users.user_id, users.username, users.email, images.path as image_path FROM dialogues 
    JOIN users ON users.user_id = dialogues.second_user_id
    LEFT JOIN images ON users.user_id = images.user_id
    WHERE dialogues.dialogue_id = $1`

const selectUserByIdQuery =
    'SELECT user_id as id, username, email, password FROM users WHERE user_id=$1'

class DialoguesService {
    async addDialogue(refreshToken, secondUserId) {
        const ownerId = tokenService.validationRefreshToken(refreshToken).id

        if (!ownerId) {
            throw Error(`Occurred error`)
        }
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
            .query(creteDialogueQuery, [ownerId, secondUserId, ownerId])
            .then((res) => res.rows[0].dialogue_id)

        const dialogue = await pool
            .query(selectDialoguesByIdQuery, [dialogueId])
            .then((res) => res.rows[0])

        return dialogue
    }

    async getDialogues(refreshToken) {
        const ownerId = tokenService.validationRefreshToken(refreshToken).id

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
            .query(selectDialoguesByFirstUserIdQuery, [ownerId])
            .then((res) => res.rows)

        return dialogues
    }

    async getDialogueForNotOwner(dialogueId) {
        const user = await pool
            .query(selectDialogueForNotOwnerUserByIdQuery, [dialogueId])
            .then((res) => res.rows[0])
        return user
    }
}

module.exports = new DialoguesService()
