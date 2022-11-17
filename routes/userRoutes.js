const {
    addAvatar,
    getUsers,
    addToFriends,
    deleteFromFriends,
    getFriends
} = require('../controllers/userControllers')
const Router = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const router = new Router()

router.post('/set-avatar', authMiddleware, addAvatar)
router.get('/users', authMiddleware, getUsers)


module.exports = router
 