const s3 = require('../aws/index')
const pool = require('../db')

const insertImageQuery =
    'INSERT INTO images (path, user_id) VALUES ($1, $2) RETURNING user_id as id, path'
const selectUserByIdQuery =
    'SELECT user_id as id, username, email, password FROM users WHERE user_id=$1'

const selectUserByUserNameQuery =
    'SELECT user_id as id, username, email, password FROM users WHERE username=$1'

const selectUserById = `SELECT users.user_id as id, users.username, images.path as image_path FROM users LEFT JOIN images ON images.user_id = users.user_id WHERE users.user_id=$1`

const selectUsersQuery =
    `SELECT users.user_id, users.username, users.email, images.path as imagePath FROM users 
    LEFT JOIN images ON images.user_id = users.user_id WHERE users.user_id != $1 ORDER BY user_id DESC 
    LIMIT $2 OFFSET $3`

    const selectImageByUserIdQuery = 'SELECT path FROM images WHERE user_id = $1'

const selectInterlocutorUserByDialogueIdAndOwnerUserId = `SELECT users.user_id, users.username, images.path as image_path FROM users 
    JOIN dialogues ON ((users.user_id = dialogues.second_user_id) AND (dialogues.second_user_id != $1)) 
    OR 
    ((users.user_id = dialogues.first_user_id) AND (dialogues.first_user_id != $1)) 
    LEFT JOIN images ON images.user_id = users.user_id
    WHERE dialogues.dialogue_id = $2
    GROUP BY users.user_id, images.path`

class UserService {
    async addAvatar(file, id) {
        const userDate = await pool
            .query(selectUserByIdQuery, [id])
            .then((res) => res.rows[0])

        if (!userDate) {
            throw Error(`The user with id ${id} isn't exists`)
        }

        const existingPicture = await pool
            .query(selectImageByUserIdQuery, [id])
            .then((res) => res.rows[0])

        if (existingPicture) {
            throw Error(`The image already exists for this user`)
        }

        const imageName = new Date().getTime() + '-' + file.name

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imageName,
            Body: file.data,
            ACL: 'public-read-write',
            ContentType: file.mimetype,
        }

        const uploadedImage = await s3.upload(params).promise()

        const image = await pool
            .query(insertImageQuery, [uploadedImage.Location, id])
            .then((res) => res.rows[0])

        return image.path
    }

    async getUsers(id, page) {
        const limit = 20

        let offset = page ? (page ) * limit : 0

        const users = await pool.query(selectUsersQuery, [id, limit, offset]).then((res) => res.rows)
        return users
    } 

    async getUserByUsername(username) {
        const users = await pool
            .query(selectUserByUserNameQuery, [username])
            .then((res) => res.rows[0])
        return users
    }

    async getUserById(id) {
        const users = await pool
            .query(selectUserById, [id])
            .then((res) => res.rows[0])
        return users
    }

    async getInterlocutorUserId(user_id, dialogue_id) {
        const users = await pool
            .query(selectInterlocutorUserByDialogueIdAndOwnerUserId, [user_id, dialogue_id])
            .then((res) => res.rows[0])
        return users
    }

}

module.exports = new UserService()
