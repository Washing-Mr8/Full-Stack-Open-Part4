const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    after(async () => {
        await mongoose.connection.close()
    })

    describe('When a new user is created', () => {
        test('creation succeeds with a fresh username', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'mluukkai',
                name: 'Matti Luukkainen',
                password: 'salainen',
            }

            await api
                .post('/api/users')
                .send(newUser)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

            const usernames = usersAtEnd.map(u => u.username)
            assert(usernames.includes(newUser.username))
        })

        test('creation fails with proper statuscode and message if username already taken', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'root',
                name: 'Superuser',
                password: 'salainen',
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            assert(result.body.error.includes('expected `username` to be unique'))

            assert.strictEqual(usersAtEnd.length, usersAtStart.length)
        })

        test('creation fails with proper statuscode and message if password isn`t correct', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'Name_1',
                name: 'Anyone',
                password: 'at',
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            assert(result.body.error.includes('Password must be 3 characters at least'))
            assert.strictEqual(usersAtEnd.length, usersAtStart.length)
        })

        test('creation fails with proper statuscode and message if username isn`t correct', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'No',
                name: 'Anyone',
                password: 'demo1234',
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            assert(result.body.error.includes('The username has to be at least 3 characters'))
            assert.strictEqual(usersAtEnd.length, usersAtStart.length)
        })
    })


})