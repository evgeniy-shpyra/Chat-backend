const Router = require('express')
const { addDialogue, getDialogues, deleteDialogue } = require('../controllers/dialoguesControllers')
const authMiddleware = require('../middleware/authMiddleware')

const router = new Router()

router.post('/dialogue/:id', authMiddleware, addDialogue)
router.get('/dialogues', authMiddleware, getDialogues)
router.delete('/dialogue/:id', authMiddleware, deleteDialogue)


module.exports = router
 