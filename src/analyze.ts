import * as R from 'ramda';
import {
  computeTermFrequency,
  computeInverseDocumentFrequency,
} from './lib';
import { ImportanceDictionary, ITermFrequencyDictionary } from './lib/interfaces';

interface Review {
  date: string;
  text: string;
  title: string;
  stars: number;
  is_avp: boolean;
  review_url: string;
  helpful_for: number;
}

interface Product {
  url: string;
  brand: string;
  reviews: Review[];
}

const reviewToText = (review: Review) => `${review.title} ${review.text}`;

export const productsToTexts = (products: Product[]) => R.compose(
  R.map<Review, string>(reviewToText),
  R.flatten,
  R.map<Product, Review[]>(product => product.reviews),
)(products);

// FIXME: You and you exists
export const computeImportance = (products: Product[]) => {
  const texts = productsToTexts(products);
  return R.reduce<string, ImportanceDictionary>((dict, text) => {
    const computedDict = R.compose(
      R.mapObjIndexed<number, number>((coef, word) => {
        return coef * computeInverseDocumentFrequency(word, texts);
      }),
      computeTermFrequency,
    )(text);
    return {...dict, ...computedDict};
  }, {})(texts);
}
