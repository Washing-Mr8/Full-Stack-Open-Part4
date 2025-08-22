const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (req, res, next) => {
  try {
    const blogs = await Blog.find({}).populate('user')
    res.status(200).json(blogs)

  } catch (exception) {
    next(exception)
  }
})

blogsRouter.post('/', async (req, res, next) => {

  const body = req.body
  if (!body.title || !body.url) {
    return res.status(400).json({
      error: 'title and url are required'
    })
  }
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes, // Si no viene, mongoose usará el default: 0
      user: user.id
    })
    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog.id)
    await user.save()

    res.status(201).json(savedBlog)
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.get('/:id', async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('user')
    if (blog) {
      res.json(blog)
    } else {
      res.status(404).end()
    }
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.delete('/:id', async (req, res, next) => {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = await Blog.findById(req.params.id)
    if (!blog) {
      return res.status(404).json({ error: 'blog not found' })
    }

    if (blog.user.toString() !== user.id.toString()) {
      return res.status(403).json({ error: 'only the creator can delete this blog' })
    }

    const deletedBlog = await Blog.findByIdAndDelete(req.params.id)

    //eliminamos la referencia al blog dentro del schema de user
    user.blogs = user.blogs.filter(blogId => blogId.toString() !== req.params.id)
    await user.save()

    res.status(204).end()
  } catch (exception) {
    // console.log('error in delete:', exception.message)
    next(exception)
  }
})

blogsRouter.put('/:id', async (req, res, next) => {
  const { title, author, url, likes } = req.body

  const blog = {
    title,
    author,
    url,
    likes
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      blog,
      { new: true, runValidators: true, context: 'query' }
    )

    if (!updatedBlog) {
      return res.status(404).json({ error: 'blog not found' })
    }

    res.json(updatedBlog)
  } catch (exception) {
    if (exception.name === 'ValidationError') {
      return res.status(400).json({ error: exception.message })
    }
    next(exception)
  }
})

module.exports = blogsRouter