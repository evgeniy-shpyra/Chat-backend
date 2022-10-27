const { addAvatar, getUsers } = require('../controllers/userControllers')
const Router = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const router = new Router()

router.post('/setavatar/:id', authMiddleware, addAvatar)
router.get('/users', authMiddleware, getUsers)

module.exports = router
