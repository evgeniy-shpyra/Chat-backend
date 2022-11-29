const dialoguesServices = require('../Services/dialoguesServices')

module.exports.addDialogue = async (req, res, next) => {
    try {
        const secondUserId = req.params.id

        const dialogue = await dialoguesServices.addDialogue(
            req.user.id,
            secondUserId
        )

        return res.json({ data: dialogue, resultCode: 1 })
    } catch (e) {
        console.log(e)
        return res.json({ msg: e.message, resultCode: 0 })
    }
}

module.exports.getDialogues = async (req, res, next) => {
    try {
        const page = req.query.page
        const name = req.query.name

        const dialogues = await dialoguesServices.getDialogues(
            req.user.id,
            name,
            page
        )

        return res.json({ data: dialogues, resultCode: 1 })
    } catch (e) {
        console.log(e)
        return res.json({ msg: e.message, resultCode: 0 })
    }
}

module.exports.deleteDialogue = async (req, res, next) => {
    try {
        const dialogueId = req.params.id

        await dialoguesServices.deleteDialogue(dialogueId)

        return res.json({ data: { id: dialogueId }, resultCode: 1 })
    } catch (e) {
        console.log(e)
        return res.json({ msg: e.message, resultCode: 0 })
    }
}
