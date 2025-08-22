const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    }
  ]

  const manyBlogs = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    },
    {
      _id: '5a422aa71b54a6763243d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Peter Griffin',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 10,
      __v: 0
    },
    {
      _id: '5a422aa71b54b33565342323d3',
      title: 'Go To Statement Considered Harmful',
      author: 'Joe Swanson',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 20,
      __v: 0
    }
  ]

  test('of empty list ois zero', () => {
    const result = listHelper.totalLikes([])
    assert.strictEqual(result, 0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.totalLikes(manyBlogs)
    assert.strictEqual(result, 35)
  })
})

describe('favorite blog', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    }
  ]

  const manyBlogs = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    },
    {
      _id: '5a422aa71b54a6763243d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Peter Griffin',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 10,
      __v: 0
    },
    {
      _id: '5a422aa71b54b33565342323d3',
      title: 'Go To Statement Considered Harmful',
      author: 'Joe Swanson',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 10,
      __v: 0
    }
  ]

  const emptyValue = {
    title: "",
    author: "",
    likes: 0
  }

  const favorite1 = {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    likes: 5
  }

    const favorite2 = {
      title: 'Go To Statement Considered Harmful',
      author: 'Peter Griffin',
      likes: 10,
  }

  test('of empty list is zero', () => {
    const result = listHelper.favoriteBlog([])
    assert.deepStrictEqual(result, emptyValue)
  })

  test('when list has only one blog, that is the favorite one', () => {
    const result = listHelper.favoriteBlog(listWithOneBlog)
    assert.deepStrictEqual(result, favorite1)
  })

  test('favorite of all the blogs on the list', () => {
    const result = listHelper.favoriteBlog(manyBlogs)
    assert.deepStrictEqual(result, favorite2)
  })
})

describe('most blogs', () => {
  const emptyList = []

  const listWithOneBlog = [
    {
      author: 'Edsger W. Dijkstra',
      title: 'Go To Statement Considered Harmful',
      likes: 5
    }
  ]

  const multipleBlogs = [
    { author: 'Robert C. Martin', title: 'Clean Code', likes: 10 },
    { author: 'Robert C. Martin', title: 'Agile Principles', likes: 15 },
    { author: 'Robert C. Martin', title: 'Patterns', likes: 8 },
    { author: 'Martin Fowler', title: 'Refactoring', likes: 12 },
    { author: 'Martin Fowler', title: 'DSL', likes: 7 },
    { author: 'Uncle Bob', title: 'TDD', likes: 9 }
  ]

  test('of empty list is null', () => {
    const result = listHelper.mostBlogs(emptyList)
    assert.strictEqual(result, null)
  })

  test('when list has only one blog, that author has 1 blog', () => {
    const result = listHelper.mostBlogs(listWithOneBlog)
    assert.deepStrictEqual(result, {
      author: 'Edsger W. Dijkstra',
      blogs: 1
    })
  })

  test('of multiple blogs returns author with most blogs', () => {
    const result = listHelper.mostBlogs(multipleBlogs)
    assert.deepStrictEqual(result, {
      author: 'Robert C. Martin',
      blogs: 3
    })
  })

  test('when multiple authors have same blog count, returns one of them', () => {
    const tiedBlogs = [
      { author: 'Author A', title: 'Blog 1', likes: 5 },
      { author: 'Author A', title: 'Blog 2', likes: 3 },
      { author: 'Author B', title: 'Blog 3', likes: 7 },
      { author: 'Author B', title: 'Blog 4', likes: 4 }
    ]
    
    const result = listHelper.mostBlogs(tiedBlogs)
    // Puede devolver Author A o Author B, ambos tienen 2 blogs
    assert.strictEqual(result.blogs, 2)
    assert(['Author A', 'Author B'].includes(result.author))
  })
})

describe('most likes', () => {
  const emptyList = []

  const listWithOneBlog = [
    {
      author: 'Edsger W. Dijkstra',
      title: 'Go To Statement Considered Harmful',
      likes: 5
    }
  ]

  const multipleBlogs = [
    { author: 'Robert C. Martin', title: 'Clean Code', likes: 10 },
    { author: 'Robert C. Martin', title: 'Agile Principles', likes: 15 },
    { author: 'Robert C. Martin', title: 'Patterns', likes: 8 },
    { author: 'Martin Fowler', title: 'Refactoring', likes: 12 },
    { author: 'Martin Fowler', title: 'DSL', likes: 7 },
    { author: 'Uncle Bob', title: 'TDD', likes: 9 }
  ]

  const complexCase = [
    { author: 'Edsger W. Dijkstra', title: 'A', likes: 2 },
    { author: 'Edsger W. Dijkstra', title: 'B', likes: 5 },
    { author: 'Edsger W. Dijkstra', title: 'C', likes: 10 }, // Total: 17
    { author: 'Robert C. Martin', title: 'D', likes: 8 },
    { author: 'Robert C. Martin', title: 'E', likes: 7 },    // Total: 15
    { author: 'Martin Fowler', title: 'F', likes: 12 }       // Total: 12
  ]

  test('of empty list is null', () => {
    const result = listHelper.mostLikes(emptyList)
    assert.strictEqual(result, null)
  })

  test('when list has only one blog, that author has those likes', () => {
    const result = listHelper.mostLikes(listWithOneBlog)
    assert.deepStrictEqual(result, {
      author: 'Edsger W. Dijkstra',
      likes: 5
    })
  })

  test('of multiple blogs returns author with most total likes', () => {
    const result = listHelper.mostLikes(multipleBlogs)
    assert.deepStrictEqual(result, {
      author: 'Robert C. Martin',
      likes: 33  // 10 + 15 + 8 = 33
    })
  })

  test('returns author with highest like sum in complex case', () => {
    const result = listHelper.mostLikes(complexCase)
    assert.deepStrictEqual(result, {
      author: 'Edsger W. Dijkstra',
      likes: 17  // 2 + 5 + 10 = 17
    })
  })

  test('when multiple authors have same like count, returns one of them', () => {
    const tiedLikes = [
      { author: 'Author A', title: 'Book 1', likes: 10 },
      { author: 'Author A', title: 'Book 2', likes: 5 },  // Total: 15
      { author: 'Author B', title: 'Book 3', likes: 8 },
      { author: 'Author B', title: 'Book 4', likes: 7 }   // Total: 15
    ]
    
    const result = listHelper.mostLikes(tiedLikes)
    assert.strictEqual(result.likes, 15)
    assert(['Author A', 'Author B'].includes(result.author))
  })
})