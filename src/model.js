import { SentimentAnalyzer, PorterStemmer, LancasterStemmer } from 'natural';

class Model {
  /**
   * By default stemmer is Porter
   * @param {String} stemmer can be `lanchaster` or `porter`.
   */
  constructor(stemmer = 'porter') {
    switch (stemmer) {
      case 'porter':
        this.stemmer = PorterStemmer;
        break;
      case 'lanchaster':
      default:
        this.stemmer = LancasterStemmer;
        break;
    }

    this.analyzer = new SentimentAnalyzer('English', this.stemmer, 'afinn');
  }

  /**
   * Calculate sentiment of sentence
   * @param {Array} words - array of strings
   */
  sentiment(words) {
    return this.analyzer.getSentiment(words) || 0;
  }
}

export default Model;
