const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@cluster0.aoi3mny.mongodb.net/bloglist?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url).then(() => {
    const blogSchema = mongoose.Schema({
        title: String,
        author: String,
        url: String,
        likes: Number
  })

  const Blog = mongoose.model('Blog', blogSchema)

  const blog = new Blog({
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  })

  blog.save().then(result => {
    console.log('blog saved!')
    mongoose.connection.close()
  })
  /*
  Blog.find({}).then(result => {
    result.forEach(blog => {
      console.log(blog)
    })
    mongoose.connection.close()
  })*/
})