const fs = require('fs')
const path = require('path')

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

    weight *= 100

    // if bought not on aws
    if (!review.is_avp) {
      weight /= 2
    }

    weight += review.stars / (stars || 1)
    weight += review.helpful_for / (helpful || 1)
    console.log(`brand ${product.brand}\treview: ${review.date}\tweight: ${weight}`)
    review.weight = weight
  }

  product.sentiment = product.reviews.reduce((sum, cur) => sum + cur.weight, 0) / product.reviews.length
}

const orderedProducts = products.sort((a, b) => a.sentiment > b.sentiment ? -1 : a.sentiment < b.sentiment ? 1 : 0)

const RESULTS_DIR = 'results'

if (fs.existsSync(path.resolve(__dirname, RESULTS_DIR))) {
  fs.writeFileSync(path.resolve(__dirname, RESULTS_DIR, `${Date.now()}_results.json`), JSON.stringify(orderedProducts, null, 2), { encoding: 'utf-8' })
} else {
  fs.mkdir(path.resolve(__dirname, RESULTS_DIR), err => {
    if (err) return console.log(err)
    fs.writeFileSync(path.resolve(__dirname, RESULTS_DIR, `${Date.now()}_results.json`), JSON.stringify(orderedProducts, null, 2), { encoding: 'utf-8' })
  })
}

orderedProducts.forEach((product, index) => {
  console.log(`${index + 1}. ${product.brand} - ${product.sentiment}`)
})
