const dialoguesServices = require('../Services/dialoguesServices')

class DialoguesSocketController {
    getDialogueForNotOwner = async (dialogueId) => {
        try {
            const user = await dialoguesServices.getDialogueForNotOwner(
                dialogueId
            )
            return user
        } catch (e) {
            console.log(e)
            return false
        }
    }
}

module.exports = new DialoguesSocketController()