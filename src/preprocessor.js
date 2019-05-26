import { flow } from 'lodash';
import { PorterStemmer, WordTokenizer, LancasterStemmer } from 'natural';

import stopwords from './stopwords.json';


class Preprocessor {
  /**
   * By default stemmer is Porter
   * @param {String} stemmer can be `lanchaster` or `porter`.
   */
  constructor(stemmer = 'porter') {
    this.tokenizer = new WordTokenizer();
    this.stopwords = new Set(stopwords);

    switch (stemmer) {
      case 'lanchaster':
        this.stemmer = LancasterStemmer;
        break;
      case 'porter':
      default:
        this.stemmer = PorterStemmer;
        break;
    }
  }

  /**
   * Helper to lowercase all input text
   * @param {String} text - input text
   */
  toLowerCase(text) {
    return text.toLowerCase();
  }

  /**
   * Split text to tokens
   * @param {String} text - input text
   */
  tokenize(text) {
    return this.tokenizer.tokenize(text);
  }

  /**
   * Remove stop words from input array
   * @param {Array} words - array of strings
   */
  removeStopWords(words) {
    if (!Array.isArray(words)) {
      throw Error('Wrong argument!');
    }

    return words.filter(word => !this.stopwords.has(word));
  }

  /**
   * Remove numbers from input text
   * @param {String} text - input text
   */
  removeNumbers(text) {
    return text.replace(/[0-9]/g, '');
  }

  /**
   * Normalize text by stemming
   * @param {Array} tokens - array of strings
   */
  normalize(tokens) {
    return tokens.map(token => this.stemmer.stem(token));
  }

  /**
   * Prepare text for next processing
   * @param {String} text - input text
   */
  preprocess(text) {
    const preprocess = flow([
      this.removeNumbers.bind(this),
      this.toLowerCase.bind(this),
      this.tokenize.bind(this),
      this.removeStopWords.bind(this),
      this.normalize.bind(this),
    ]);
    return preprocess(text);
  }
}

export default Preprocessor;
