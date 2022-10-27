const userService = require('../Services/userServices')

module.exports.addAvatar = async (req, res, next) => {
    try {
        const file = req.files
        const params = req.params

        const path = await userService.addAvatar(file.image, params.id)

        res.json({ path: path })
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

        res.json({ users })
        next()
    } catch (e) {
        console.log(e)
        res.json({ msg: e.message, resultCode: 0 })
        next()
    }
}
