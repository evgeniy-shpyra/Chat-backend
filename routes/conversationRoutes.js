const Router = require('express')
const conversationController = require('../controllers/conversationControllers')
const authMiddleware = require('../middleware/authMiddleware')

const router = new Router()

router.get(
    '/conversation/:id',
    authMiddleware,
    conversationController.getConversation
)
router.post('/message', authMiddleware, conversationController.addMessage)
router.delete(
    '/conversation/:id',
    authMiddleware,
    conversationController.clearHistory
)

module.exports = router
