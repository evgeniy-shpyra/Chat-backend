const { register } = require('../controllers/userControllers')
const Router = require('express')
const router = new Router()

router.post('/register', register)

module.exports = router
