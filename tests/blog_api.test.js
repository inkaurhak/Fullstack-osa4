const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe.only('when there is initially some blogs saved', () => {
  test.only('correct amount of blogs returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, 2)
  })

  test('identifying field is named id', async () => {
    const response = await api.get('/api/blogs')
  
    const keys = response.body.map(e => Object.keys(e))
    keys.forEach(key => {
      assert.strictEqual(key.includes("id"), true)
      assert.strictEqual(key.includes("_id"), false)
    })
  })
})

describe('adding new blogs', () => {
  // korjattava testi! lisää login
  test('a blog can be added', async () => {
    const newBlog = {
      title: "First class tests",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
      likes: 10
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const response = await api.get('/api/blogs')
    const contents = response.body.map(r => r.title)
    assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
    assert(contents.includes("First class tests"))
  })

  test('blog can not be added if there is no token', async () => {
    //testi
  })

  // korjattava testi
  test('likes is 0 if it is not given a value', async () => {
    const newBlog = {
      title: "First class tests",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll"
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
  
    const response = await api.get('/api/blogs')
    const contents = response.body.map(r => r)
      
    contents.forEach(b => {
      if (b.title === "First class tests") {
        assert.strictEqual(b.likes, 0)
      }
    })
  
    assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
  })

  test('if blog has no title or url, it returns 400', async () => {
    const blogWithoutTitle = {
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
      likes: 10
    }
  
    const blogWithoutUrl = {
      title: "TDD harms architecture",
      author: "Robert C. Martin",
      likes: 0,
    }
  
    await api
      .post('/api/blogs')
      .send(blogWithoutTitle)
      .expect(400)
  
    await api
      .post('/api/blogs')
      .send(blogWithoutUrl)
      .expect(400)
  })
})

describe('deleting or updating a blog', () => {
  //korjattava
  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
  
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
  
    const titles = blogsAtEnd.map(r => r.title)
    assert(!titles.includes(blogToDelete.title))
  })
  
  test('likes in a blog can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
  
    const blogUpdate = {
      author: blogToUpdate.author,
      title: blogToUpdate.title,
      url: blogToUpdate.url,
      likes: blogToUpdate.likes + 10
    }
  
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogUpdate)
      .expect(200)
  
    const blogsAtEnd = await helper.blogsInDb()
    const updatedBlog = blogsAtEnd[0]
  
    assert.strictEqual(updatedBlog.likes, blogToUpdate.likes+ 10)
  })
})

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('salainen', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Anna123',
      name: 'Anna',
      password: 'sala',
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

  test('user is not created if username is under 3 characters long', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'a',
      name: 'Anna',
      password: 'salasana'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes('User validation failed'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('user is not created if password is under 3 characters long', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Anna123',
      name: 'Anna',
      password: 'a'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes('password is too short'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})