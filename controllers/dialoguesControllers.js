const dialoguesServices = require('../Services/dialoguesServices')

module.exports.addDialogue = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies
        const secondUserId = req.params.id

        const dialogue = await dialoguesServices.addDialogue(refreshToken, secondUserId)

        return res.json({ data: dialogue, resultCode: 1 })

    } catch (e) {
        console.log(e)
        return res.json({ msg: e.message, resultCode: 0 })
    }
}
 
module.exports.getDialogues = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies

        const dialogues = await dialoguesServices.getDialogues(refreshToken)

        return res.json({ data: dialogues, resultCode: 1 })
        
    } catch (e) {
        console.log(e)
        return res.json({ msg: e.message, resultCode: 0 })
    }
}
 