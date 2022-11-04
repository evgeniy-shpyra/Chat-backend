const { addAvatar, getUsers, getAvatar } = require('../controllers/userControllers')
const Router = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const router = new Router()

router.post('/setavatar/:id', authMiddleware, addAvatar)
router.get('/users', authMiddleware, getUsers)
router.get('/avatar/:id', authMiddleware, getAvatar)

module.exports = router
