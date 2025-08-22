const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
        likes: 5,
    },
    {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        url: 'https://cleancode.com',
        likes: 10,
    },
    {
        title: 'Refactoring',
        author: 'Martin Fowler',
        url: 'https://refactoring.com',
        likes: 15,
    }
]

const nonExistingId = async () => {
    const blog = new Blog({
        title: 'delete',
        author: 'delete',
        url: 'delete',
        likes: 0,
    })
    await blog.save()
    await blog.deleteOne()

    return blog._id.toString()
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
    initialBlogs, nonExistingId, blogsInDb, usersInDb
}