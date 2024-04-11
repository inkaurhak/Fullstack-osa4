const info = (...params) => {
  if (process.nextTick.NODE_ENV !== 'test') {
    console.log(...params)
  }
}
  
const error = (...params) => {
  if (process.nextTick.NODE_ENV !== 'test') {
    console.error(...params)
  }
}

module.exports = {
  info, error
}