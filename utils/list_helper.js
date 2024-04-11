const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  let total = 0
  blogs.forEach(blog => {
    total += blog.likes
  })
  return total
}

const favoriteBlog = (blogs) => {
  favorite = blogs[0]
  blogs.forEach(blog => {
    if (blog.likes > favorite.likes) {
      favorite = {
        title: blog.title,
        author: blog.author,
        likes: blog.likes
      }
    }
  })
  return favorite
}

const mostBlogs = (blogs) => {
  authors = []
  blogs.forEach(blog => {
    authors.push(blog.author)
  })
  const uniqueAuthors = new Set(authors)
    
  authors.sort()

  let highestCount = 0
  most = {}

  uniqueAuthors.forEach(author => {
    const start = authors.indexOf(author)
    const end = authors.lastIndexOf(author)
    const count = end-start+1

    if (count > highestCount) {
      highestCount = count
      most = {author: author, blogs: count}
    }

    if (count == highestCount && !most.author === author) {
      most = {author: author, blogs: count}
    }
  })
  return most
}

const mostLikes = (blogs) => {
  blogs.sort()
  authors = []
  blogs.forEach(blog => {
    if (authors.indexOf(blog.author) < 0) {
      authors.push(blog.author)
    }
  })

  likesList = []

  authors.forEach(author => {
    likes = 0
    blogs.forEach(blog => {
      if (blog.author === author) {
        likes += blog.likes
      }
    })
    likesList.push({author: author, likes: likes})
  })

  most = likesList[0]
  likesList.forEach(list => {
    if (list.likes > most.likes) {
      most = list
    }
  })
  return most
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}