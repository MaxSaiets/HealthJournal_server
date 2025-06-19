const Router = require('express')
const authRouter = require('./authRouter')
const healthEntryRouter = require('./healthEntryRouter')
const reminderRouter = require('./reminderRouter')
const quoteRouter = require('./quoteRouter')
const userRouter = require('./userRouter')

const router = new Router() // головний роутер 

router.use('/auth', authRouter)
router.use('/entries', healthEntryRouter)
router.use('/reminders', reminderRouter)
router.use('/quotes', quoteRouter)
router.use('/user', userRouter)

module.exports = router

