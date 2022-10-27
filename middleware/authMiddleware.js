const jwt = require('jsonwebtoken')
const tokenService = require('../Services/tokenService')

module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization
        if (!authorizationHeader) throw new Error('User is not authorized')

        const accessToken = authorizationHeader.split(' ')[1]
        if (!accessToken) throw new Error('User is not authorized')

        const userData = tokenService.validationAccessToken(accessToken)
        if (!userData) throw new Error('User is not authorized')

        req.user = userData
        next()
    } catch (e) {
        res.json({ msg: e.message, resultCode: 0 })
        return
    }
}
