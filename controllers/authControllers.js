const authService = require('../Services/authServices')
const { OAuth2Client } = require('google-auth-library')

module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body

        const user = await authService.registration({
            username,
            email,
            password,
        })
        res.cookie('refreshToken', user.tokens.refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        })
        res.json({ data: user, resultCode: 1 })
        next()
    } catch (e) {
        console.log(e.message)
        res.json({ msg: e.message, resultCode: 0 })
        next()
    }
}

module.exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body

        const user = await authService.login({ username, password })
        res.cookie('refreshToken', user.tokens.refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        })
        res.json({ data: user, resultCode: 1 })

        next()
    } catch (e) {
        console.log(e)
        res.json({ msg: e.message, resultCode: 0 })

        next()
    }
}

module.exports.refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies
       
        const userData = await authService.refresh(refreshToken)

        res.cookie('refreshToken', userData.tokens.refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        })

        res.json({ data: userData, resultCode: 1 })
    } catch (e) {
        console.log(e)
        res.json({ msg: e.message, resultCode: 0 })
        next()
    }
}
