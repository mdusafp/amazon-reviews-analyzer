import chalk from 'chalk';
import { map } from 'lodash';

import Model from './model';
import Preprocessor from './preprocessor';
import { generateArray, generateProduct } from './generator';

async function main() {
  const preprocessor = new Preprocessor();
  const products = generateArray({ generator: generateProduct, length: 10 });
  const model = new Model();

  for(let product of products) {
    const reviewToText = review => `${review.title} ${review.text}`;
    const text = map(product.reviews, reviewToText).join('');
    const sentiment = model.sentiment(preprocessor.preprocess(text));
    console.info(chalk.blue(`sentiment: ${sentiment}`));
  }
}

main();
