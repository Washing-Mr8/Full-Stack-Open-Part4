const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (req, res) => {
    const users = await User.find({})
    res.json(users)
})

usersRouter.post('/', async (req, res, next) => {
    const { username, name, password } = req.body

    if (!password || password.length < 3) {
        console.log(password)
        return res.status(400).json({ error: 'Password must be 3 characters at least' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash,
    })

    try {
        const savedUser = await user.save()
        res.status(201).json(savedUser)
    } catch (error) {
        next(error)
    }

})

module.exports = usersRouter