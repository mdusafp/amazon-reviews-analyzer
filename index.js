const Sentiment = require('sentiment')
const products = require('./dump.json')

const tool = new Sentiment()

for (const product of products) {
  // recomputing weights (use stars and likes)
  const { stars, helpful } = product.reviews.reduce((result, review) => {
    result.stars += review.stars
    result.helpful += review.helpful_for
    return result
  }, { stars: 0, helpful: 0 })

  for (const review of product.reviews) {
    // computing weights (use sentiment analyze)
    let weight =
      tool.analyze(review.title).comparative + tool.analyze(review.text).comparative

    weight *= 1000

    // if bought not on aws
    if (!review.is_avp) {
      weight /= 2
    }

    weight += review.stars / stars
    weight += review.helpful_for / helpful
    console.log(`brand ${product.brand}\treview: ${review.date}\tweight: ${weight}`)
    review.weight = weight
  }

  product.average = product.reviews.reduce((sum, cur) => sum + cur.weight, 0) / product.reviews.length
}

const orderedProducts = products.sort((a, b) => a.average > b.average ? -1 : a.average < b.average ? 1 : 0)
orderedProducts.forEach((product, index) => {
  console.log(`${index + 1}. ${product.brand} - ${product.average}`)
})
