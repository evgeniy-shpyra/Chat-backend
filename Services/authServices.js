const pool = require('../db')
const bcrypt = require('bcrypt')
const tokenService = require('./tokenService')
const userServices = require('./userServices')

const insertUserQuery =
    'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING user_id as id, username, email'
const selectUserByUsernameQuery =
    'SELECT users.user_id AS id, users.username, users.email, users.password, images.path AS image_path FROM users LEFT JOIN images ON images.user_id = users.user_id WHERE users.username=$1'
const selectUserByEmailQuery =
    'SELECT user_id as id, username , email, password FROM users WHERE email=$1'

class AuthService {
    async registration({ username, email, password }) {
        const checkUsername = await pool
            .query(selectUserByUsernameQuery, [username])
            .then((res) => res.rows)
        if (checkUsername.length > 0) throw new Error('Username already used')

        const checkEmail = await pool
            .query(selectUserByEmailQuery, [email])
            .then((res) => res.rows)
        if (checkEmail.length > 0) throw new Error('Email already used')

        const hashPassword = await bcrypt.hash(password, 10)

        const user = await pool
            .query(insertUserQuery, [username, email, hashPassword])
            .then((res) => res.rows[0])

        const tokens = tokenService.generateTokens({
            id: user.id,
            username,
            email,
        })

        await tokenService.saveToken(user.id, tokens.refreshToken)

        return { user, tokens }
    }

    async login({ username, password }) {
        const selectUser = await pool
            .query(selectUserByUsernameQuery, [username])
            .then((res) => res.rows[0])

        if (!selectUser) throw new Error('Incorrect username or password')

        const isPasswordRight = await bcrypt.compare(
            password,
            selectUser.password
        )

        if (!isPasswordRight) {
            throw new Error('Incorrect username or password')
        }

        const user = {
            username: selectUser.username,
            id: selectUser.id,
            email: selectUser.email,
        }

        const tokens = await tokenService.generateTokens({
            ...user,
        })

        await tokenService.saveToken(user.id, tokens.refreshToken)

        user.image_path = selectUser.image_path

        return { user, tokens }
    }

    async refresh(refreshToken) {

        if (!refreshToken) throw new Error('The user is not authorized')

        const userData = tokenService.validationRefreshToken(refreshToken)

        const tokenFindDb = await tokenService.findToken(refreshToken)

        if (!userData || !tokenFindDb) {
            throw new Error('The user is not authorized')
        }

        const selectUser = await pool
            .query(selectUserByUsernameQuery, [userData.username])
            .then((res) => res.rows[0])

        const user = {
            username: selectUser.username,
            id: selectUser.id,
            email: selectUser.email,
        }

        const tokens = await tokenService.generateTokens({
            ...user,
        })

        await tokenService.saveToken(user.id, tokens.refreshToken)

        user.image_path = selectUser.image_path

        return { user, tokens }
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken)
        return token
    }
}

module.exports = new AuthService()
