const conversationServices = require('../Services/conversationServices')
const userServices = require('../Services/userServices')

class ConversationController {
    getConversation = async (req, res, next) => {
        try {
            const userId = req.user.id
            const dialogueId = Number(req.params.id)

            const massages = await conversationServices.getConversation(
                dialogueId
            )

            const interlocutorUser = await userServices.getInterlocutorUserId(
                userId,
                dialogueId
            )

            return res.json({
                data: { massages, interlocutorUser, dialogueId },
                resultCode: 1,
            })
        } catch (e) {
            console.log(e)
            return res.json({ msg: e.message, resultCode: 0 })
        }
    }
    addMessage = async (req, res, next) => {
        try {
            const userId = req.user.id

            const { text, dialogueId } = req.body

            const massage = await conversationServices.addMessage(
                text,
                dialogueId,
                userId
            )

            return res.json({
                data: massage,
                resultCode: 1,
            })
        } catch (e) {
            console.log(e)
            return res.json({ msg: e.message, resultCode: 0 })
        }
    }
}

module.exports = new ConversationController()
