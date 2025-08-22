const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  let likes = 0
  if (blogs) {
    for (blog of blogs) {
      likes += blog.likes
    }
  }
  return likes
}

const favoriteBlog = (blogs) => {
  let favorite = {
    title: "",
    author: "",
    likes: 0
  }

  if (blogs) {
    for (blog of blogs) {
      if (blog.likes > favorite.likes) {
        favorite = { title: blog.title, author: blog.author, likes: blog.likes }
      }
    }
  }

  return favorite
}

const mostBlogs = (blogs) => {
  if (!blogs || blogs.length === 0) {
    return null
  }

  const authorCounts = _.countBy(blogs, 'author')
  const topAuthor = _.maxBy(_.keys(authorCounts), author => authorCounts[author])

  return {
    author: topAuthor,
    blogs: authorCounts[topAuthor]
  }
}

const mostLikes = (blogs) => {
  if (!blogs || blogs.length === 0) {
    return null
  }

  const authorLikes = _.chain(blogs).groupBy('author')
    .map((authorBlogs, author) =>
    ({
      author: author,
      likes: _.sumBy(authorBlogs, 'likes')
    }))
    .value()

  return _.maxBy(authorLikes, 'likes')
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}