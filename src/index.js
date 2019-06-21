import chalk from 'chalk';
import lodash from 'lodash';
import normalize from 'normalize-object';

import logger from './logger';
import Model from './model';
import Preprocessor from './preprocessor';
import json from './comments.json';

const countStars = (total, review) => total + review.stars;
const countHelpful = (total, review) => total + review.helpfulFor;
const countSentiment = (total, review) => total + (review.sentiment * review.importance);
const randomColor = str => chalk.hex(Math.floor(Math.random() * 16777215).toString(16))(str);

const computeImportance = (review, totalStars, totalHelpful) => {
  const customerCoef = review.isAvp ? 2 : 1;
  const starsRatio = review.stars / (totalStars || 1);
  const helpfulRatio = review.helpfulFor / (totalHelpful || 1);
  return (starsRatio + helpfulRatio) * customerCoef;
};

const computeSentiment = (product, model, preprocessor) => {
  const reviews = lodash.get(product, 'reviews', []);
  const reviewToText = review => lodash.join([
    lodash.get(review, 'title', '-'),
    lodash.get(review, 'text', '-'),
  ], ' ');
  const totalStars = lodash.reduce(reviews, countStars, 0);
  const totalHelpful = lodash.reduce(reviews, countHelpful, 0);
  return {
    ...product,
    reviews: lodash.map(reviews, review => ({
      ...review,
      sentiment: model.sentiment(preprocessor.preprocess(reviewToText(review))),
      importance: computeImportance(review, totalStars, totalHelpful),
    })),
  };
};

const printReview = (product, index) => {
  const info = lodash.join([
    lodash.get(product, 'brand', '-'),
    lodash.get(product, 'sentiment', '-'),
  ], ' ');
  logger.info(randomColor(`${index + 1}. ${info}`));
};

async function main() {
  const preprocessor = new Preprocessor();
  const products = normalize(json, 'camel');
  const model = new Model();

  let productsWithSentiment = lodash.map(
    products,
    product => computeSentiment(product, model, preprocessor),
  );
  productsWithSentiment = lodash.map(productsWithSentiment, product => ({
    ...product,
    sentiment: lodash.reduce(lodash.get(product, 'reviews', []), countSentiment, 0),
  }));
  const orderedProducts = lodash.orderBy(productsWithSentiment, ['sentiment'], ['desc']);
  const topProducts = lodash.slice(orderedProducts, 0, 5);
  lodash.forEach(topProducts, printReview);
}

main();
