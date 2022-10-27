const jwt = require('jsonwebtoken')
const pool = require('../db')

const selectTokenByUserQuery =
    'SELECT refreshToken, user_id FROM tokens WHERE user_id = $1'
const selectTokenByTokenQuery =
    'SELECT refreshToken, user_id FROM tokens WHERE refreshToken = $1'
const createTokenQuery =
    'INSERT INTO tokens (refreshToken, user_id) VALUES ($1, $2) RETURNING refreshToken, user_id as id'
const updateTokenQuery =
    'UPDATE tokens SET refreshToken = $1 WHERE user_id = $2 RETURNING refreshToken, user_id as id'

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
        // const tokenData = TokenModel.deleteOne({ refreshToken })
        return tokenData
    }

    //-----------------------------------------------------------

    async findToken(refreshToken) {
        const tokenData = await pool.query(selectTokenByTokenQuery, [
            refreshToken,
        ])
        return tokenData
    }
}

module.exports = new TokenService()
