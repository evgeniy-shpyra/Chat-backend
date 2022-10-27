const { register, login, refresh } = require('../controllers/authControllers')
const Router = require('express')
const router = new Router()

router.post('/register', register)
router.post('/login', login)
router.get('/refresh', refresh)


module.exports = router
