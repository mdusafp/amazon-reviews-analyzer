import faker from 'faker';
import { map, flatMap, random } from 'lodash';

import comments from './comments.json';

const reviews = flatMap(comments, comment => comment.reviews);
const reviewTitles = map(reviews, review => review.title);
const reviewTexts = map(reviews, review => review.text);

const generateComment = () => ({
  date: faker.date.past(),
  text: reviewTexts[random(0, reviewTexts.length - 1)],
  title: reviewTitles[random(0, reviewTitles.length - 1)],
  stars: random(1, 5),
  isAvp: faker.random.boolean(),
  reviewUrl: faker.internet.url(),
  helpfulFor: random(0, 100),
});

const defaultGenerator = generateComment;

const generateArray = ({ generator = defaultGenerator, length = 10 }) => Array.from(Array(length), generator);

const generateProduct = () => ({
  url: faker.internet.url(),
  brand: faker.commerce.productName(),
  reviews: generateArray({ generator: generateComment, length: random(0, 10) }),
});

export {
  generateArray,
  generateComment,
  generateProduct,
};
