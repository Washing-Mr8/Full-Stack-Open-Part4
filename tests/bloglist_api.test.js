const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const Blog = require('../models/blog')
const User = require('../models/user')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


describe("Api tests with initial blogs allocated on DB", () => {
    let token = ''
    let userId = ''

    beforeEach(async () => {
        await Blog.deleteMany({})
        await User.deleteMany({})

        //crear usuario de prueba
        const passwordHash = await bcrypt.hash('password123', 10)
        const user = new User({
            username: 'testuser',
            name: 'Test User',
            passwordHash
        })
        await user.save()
        userId = user.id.toString()

        //obbtener token para el usuario
        const userForToken = {
            username: user.username,
            id: user._id.toString(),
        }
        token = jwt.sign(userForToken, process.env.SECRET)

        //crear blogs con el usuario
        for (let blog of helper.initialBlogs) {
            let blogObject = new Blog({ ...blog, user: userId })
            await blogObject.save()

            //agregar blog al usuario
            user.blogs = user.blogs.concat(blogObject._id)
            await user.save()
        }
    })

    after(async () => {
        await mongoose.connection.close()
    })

    describe("API response is ok", () => {
        test('blogs are returned as json', async () => {
            await api
                .get('/api/blogs')
                .expect(200)
                .expect('Content-Type', /application\/json/)
        })
    })

    describe("blogs are perfectly received", () => {
        test('there are three blogs', async () => {
            const response = await api.get('/api/blogs')
            assert.strictEqual(response.body.length, helper.initialBlogs.length)
        })

        test('the id property is not _id', async () => {
            const response = await api.get('/api/blogs')
            const firstBlog = response.body[0]
            //assert for id -> true
            assert.strictEqual('id' in firstBlog, true)
            //assert for _id -> false
            assert.strictEqual('_id' in firstBlog, false)
        })
    })

    describe('when adding a new blog', () => {

        test('a valid blog can be added ', async () => {
            const newBlog = {
                title: 'Blog',
                author: 'Demo1',
                url: 'https://fullstackopen.com/es/part4/probando_el_backend#eliminando-el-try-catch',
                likes: 20,
            }

            const response = await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const addedblog = response.body
            const blogsAtEnd = await helper.blogsInDb()

            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
            assert.strictEqual(newBlog.title, addedblog.title)
            assert.strictEqual(newBlog.author, addedblog.author)
            assert.strictEqual(newBlog.url, addedblog.url)
            assert.strictEqual(newBlog.likes, addedblog.likes)
        })
        test('fails with status 401 if no token is provided', async () => {
            const newBlog = {
                title: 'Blog without token',
                author: 'Test Author',
                url: 'http://test.com',
                likes: 5
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(401)
                .expect('Content-Type', /application\/json/)
        })

        test('fails with status 401 if token is invalid', async () => {
            const newBlog = {
                title: 'Blog with invalid token',
                author: 'Test Author',
                url: 'http://test.com',
                likes: 5
            }

            await api
                .post('/api/blogs')
                .set('Authorization', 'Bearer invalidtoken123')
                .send(newBlog)
                .expect(401)
                .expect('Content-Type', /application\/json/)
        })

        test('if likes property is missing, it defaults to 0', async () => {
            const newBlogWithoutLikes = {
                title: 'Blog without likes',
                author: 'Test Author',
                url: 'http://test.com'
                // likes property is missing
            }

            const response = await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlogWithoutLikes)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const addedBlog = response.body
            assert.strictEqual(addedBlog.likes, 0)

            // Verify its also saved correctly in database
            const blogsAtEnd = await helper.blogsInDb()
            const savedBlog = blogsAtEnd.find(b => b.id === addedBlog.id)
            assert.strictEqual(savedBlog.likes, 0)
        })

        test('fails with status 400 if title is missing', async () => {
            const newBlogWithoutTitle = {
                author: 'Test Author',
                url: 'http://test.com',
                likes: 5
                // title property is missing
            }

            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlogWithoutTitle)
                .expect(400)
        })

        test('fails with status 400 if url is missing', async () => {
            const newBlogWithoutUrl = {
                title: 'Test Blog',
                author: 'Test Author',
                likes: 5
                // url property is missing
            }

            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlogWithoutUrl)
                .expect(400)
        })

        test('fails with status 400 if both title and url are missing', async () => {
            const newBlogWithoutTitleAndUrl = {
                author: 'Test Author',
                likes: 5
                // title and url properties are missing
            }

            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlogWithoutTitleAndUrl)
                .expect(400)
        })
    })

    describe('when deleting a blog', () => {
        test('succeeds with status code 204 if id is valid and user is creator', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(204)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

            const ids = blogsAtEnd.map(b => b.id)
            assert(!ids.includes(blogToDelete.id))
        })

        test('fails with status code 401 if no token provided', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .expect(401)
        })

        test('fails with status code 404 if blog does not exist', async () => {
            const validNonexistingId = await helper.nonExistingId()

            await api
                .delete(`/api/blogs/${validNonexistingId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(404)
        })

        test('fails with status code 400 if id is invalid', async () => {
            const invalidId = 'invalid-id-format'

            await api
                .delete(`/api/blogs/${invalidId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(400)
        })
    })

    describe('when updating a blog', () => {
        test('updates the number of likes successfully', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = blogsAtStart[0]
            const newLikes = blogToUpdate.likes + 10

            const response = await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send({ ...blogToUpdate, likes: newLikes })
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const updatedBlog = response.body
            assert.strictEqual(updatedBlog.likes, newLikes)
            assert.strictEqual(updatedBlog.title, blogToUpdate.title)
            assert.strictEqual(updatedBlog.author, blogToUpdate.author)
        })

        test('updates all blog properties successfully', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = blogsAtStart[0]

            const updatedData = {
                title: 'Updated Title',
                author: 'Updated Author',
                url: 'https://updated-url.com',
                likes: 99
            }

            const response = await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send(updatedData)
                .expect(200)

            const updatedBlog = response.body
            assert.strictEqual(updatedBlog.title, updatedData.title)
            assert.strictEqual(updatedBlog.author, updatedData.author)
            assert.strictEqual(updatedBlog.url, updatedData.url)
            assert.strictEqual(updatedBlog.likes, updatedData.likes)
        })

        test('fails with status code 400 if data is invalid', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = blogsAtStart[0]

            const invalidData = {
                title: '', // title is missing
                author: 'Test Author',
                url: 'https://test.com',
                likes: 5
            }

            await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send(invalidData)
                .expect(400)
        })

        test('fails with status code 404 if blog does not exist', async () => {
            const validNonexistingId = await helper.nonExistingId()

            await api
                .put(`/api/blogs/${validNonexistingId}`)
                .send({ title: 'Test', url: 'https://test.com', likes: 5 })
                .expect(404)
        })
    })

})