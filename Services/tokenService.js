const jwt = require('jsonwebtoken')
const pool = require('../db')

const selectTokenByUserQuery =
    'SELECT refresh_token as refreshToken, user_id FROM tokens WHERE user_id = $1'
const selectTokenByTokenQuery =
    'SELECT refresh_token as refreshToken, user_id FROM tokens WHERE refresh_token = $1'
const createTokenQuery =
    'INSERT INTO tokens (refresh_token, user_id) VALUES ($1, $2) RETURNING refresh_token as refreshToken, user_id as id'
const updateTokenQuery =
    'UPDATE tokens SET refresh_token = $1 WHERE user_id = $2 RETURNING refresh_token as refreshToken , user_id as id'
const deleteTokenQuery =
    'DELETE FROM tokens WHERE refresh_token = $1 RETURNING refresh_token as refreshToken'

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: '60m',
        })
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: '20d',
        })
        return {
            accessToken,
            refreshToken,
        }
    }

    //-----------------------------------------------------------

    validationAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
            return userData
        } catch (e) {
            return null
        }
    }

    //-----------------------------------------------------------

    validationRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
            return userData
        } catch (e) {
            return null
        }
    }

    //-----------------------------------------------------------

    async saveToken(userId, refreshToken) {
        const tokenData = await pool
            .query(selectTokenByUserQuery, [userId])
            .then((res) => res.rows[0])

        if (tokenData) {
            const updatedToken = await pool.query(updateTokenQuery, [
                refreshToken,
                userId,
            ])
            return updatedToken
        }

        const token = await pool
            .query(createTokenQuery, [refreshToken, userId])
            .then((res) => res.rows[0])

        return token
    }

    //-----------------------------------------------------------

    async removeToken(refreshToken) {
        const token = await pool
            .query(deleteTokenQuery, [refreshToken])
            .then((res) => res.rows[0])
        return token
    }

    //-----------------------------------------------------------

    async findToken(refreshToken) {
        const tokenData = await pool
            .query(selectTokenByTokenQuery, [refreshToken])
            .then((res) => res.rows[0])

        return tokenData
    }
}

module.exports = new TokenService()
