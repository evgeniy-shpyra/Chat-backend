const s3 = require('../aws/index')
const pool = require('../db')

const insertImageQuery =
    'INSERT INTO images (path, user_id) VALUES ($1, $2) RETURNING user_id as id, path'
const selectUserByIdQuery =
    'SELECT user_id as id, username, email, password FROM users WHERE user_id=$1'
const selectUsersQuery = 'SELECT user_id, username, email FROM users'
const selectImageByUserIdQuery = 'SELECT path FROM images WHERE user_id = $1'

class AuthService {
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

    async getAvatar(id) {
        const userDate = await pool
            .query(selectUserByIdQuery, [id])
            .then((res) => res.rows[0])

        if (!userDate) {
            throw Error(`The user with id ${id} isn't exists`)
        }

        const imageUrl = await pool
            .query(selectImageByUserIdQuery, [id])
            .then((res) => res.rows[0])

        return imageUrl
    }

    async getUsers() {
        const users = pool.query(selectUsersQuery).then((res) => res.rows)
        return users
    }
}

module.exports = new AuthService()
