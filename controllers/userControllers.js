const userService = require('../Services/userServices')

module.exports.addAvatar = async (req, res, next) => {
    try {
        const file = req.files
        const params = req.params

        const path = await userService.addAvatar(file.image, params.id)

        res.json({ path: path, resultCode: 1 })
        next()
    } catch (e) {
        console.log(e)
        res.json({ msg: e.message, resultCode: 0 })
        next()
    }
}

module.exports.getUsers = async (req, res, next) => {
    try {
        const users = await userService.getUsers()

        res.json({ users, resultCode: 1 })
        next()
    } catch (e) {
        console.log(e)
        res.json({ msg: e.message, resultCode: 0 })
        next()
    }
}

module.exports.getAvatar = async (req, res, next) => {
    try {
        const params = req.params
        const avatarPath = await userService.getAvatar(params.id)

        res.json({ avatarPath, resultCode: 1 })
        next()
    } catch (e) {
        console.log(e)
        res.json({ msg: e.message, resultCode: 0 })
        next()
    }
}
