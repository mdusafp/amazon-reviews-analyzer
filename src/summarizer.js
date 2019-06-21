import util from 'util';
import { lexrank } from 'lexrank.js';
import { TextRank } from 'textrank';


class Summarizer {
  constructor(method) {
    if (!['lexrank', 'textrank'].includes(method)) {
      throw new Error('Method not allowed');
    }

    this.method = method;
  }

  summarize(text) {
    if (this.method === 'lexrank') {
      return lexrank(text);
    } else {
      return new TextRank(text);
    }
  }
}

export default Summarizer;
