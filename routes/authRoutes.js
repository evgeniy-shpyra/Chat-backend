const {
    register,
    login,
    refresh,
    logout,
} = require('../controllers/authControllers')
const Router = require('express')
const router = new Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/refresh', refresh)

module.exports = router
