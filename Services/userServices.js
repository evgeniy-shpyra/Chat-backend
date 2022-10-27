const s3 = require('../aws/index')
const pool = require('../db')

const insertImageQuery =
    'INSERT INTO images (path, user_id) VALUES ($1, $2) RETURNING user_id as id, path'

const selectUsersQuery = 'SELECT user_id, username, email FROM users'

class AuthService {
    async addAvatar(file, id) {
        const imageName = new Date().addAvatar() + '-' + file.name

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

    async getUsers() {
        const users = pool.query(selectUsersQuery).then((res) => res.rows)
        return users
    }
}

module.exports = new AuthService()
