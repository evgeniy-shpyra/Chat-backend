const Router = require('express')
const { addDialogue, getDialogues } = require('../controllers/dialoguesControllers')
const authMiddleware = require('../middleware/authMiddleware')

const router = new Router()

router.post('/dialogue/:id', authMiddleware, addDialogue)
router.get('/dialogues', authMiddleware, getDialogues)


module.exports = router
 