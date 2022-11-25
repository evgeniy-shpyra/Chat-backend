const userService = require('../Services/userServices')

module.exports.addAvatar = async (req, res, next) => {
    try {
        const file = req.files
        const userId = req.user.id

        const path = await userService.addAvatar(file.image, userId)

        return res.json({ path: path, resultCode: 1 })
    } catch (e) {
        console.log(e)
        return res.json({ msg: e.message, resultCode: 0 })
        next()
    }
}

module.exports.getUsers = async (req, res, next) => {
    try {
        const id = req.user.id
        const page = req.query.page

        const name = req.query.name

        const users = await userService.getUsers(id, Number(page), name)

        return res.json({ users, resultCode: 1 })
    } catch (e) {
        console.log(e)
        return res.json({ msg: e.message, resultCode: 0 })
    }
}
