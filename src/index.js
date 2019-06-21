import chalk from 'chalk';
import lodash from 'lodash';
import normalize from 'normalize-object';

import logger from './logger';
import Model from './model';
import Preprocessor from './preprocessor';
import json from './comments.json';
import Summarizer from './summarizer';

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

const reviewToText = review => lodash.join([
  lodash.get(review, 'title', '-'),
  lodash.get(review, 'text', '-'),
], ' ');

const computeSentiment = (product, model, preprocessor) => {
  const reviews = lodash.get(product, 'reviews', []);
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

const detectFeatures = (products, summarizer) => {
  const features = lodash.get(products, 'features', []);
  const corpus = lodash.flatMap(products, (product) => {
    const reviews = lodash.get(product, 'reviews', []);
    return lodash.map(reviews, reviewToText);
  });
  const text = lodash.join(corpus, ' ');
  const summary = summarizer.summarize(text);
  return lodash.intersection(features, lodash.split(summary, ' '));
};
const detectIssues = detectFeatures;

const printFeature = (feature, index) => logger.info(randomColor(`${index + 1}. ${feature}`));
const printIssue = printFeature;

const printProduct = (product, index) => {
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
  const summarizer = new Summarizer('textrank');

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
  logger.info('Top products');
  lodash.forEach(topProducts, printProduct);
  const tailProducts = lodash.slice(orderedProducts, orderedProducts.length - 5, orderedProducts.length);
  logger.info('Tail products');
  lodash.forEach(tailProducts, printProduct);

  const features = detectFeatures(topProducts, summarizer);
  const issues = detectIssues(tailProducts, summarizer);

  logger.info(chalk.magenta('Features'));
  lodash.forEach(features, printFeature);
  logger.info(chalk.magenta('Issues'));
  lodash.forEach(issues, printIssue);
}

main();
