import { ITermFrequencyDictionary } from './interfaces';

function count<T>(countableEntity: T, entities: Array<T>) {
  return entities.reduce<number>((counter, entity) => {
    return countableEntity === entity ? counter + 1 : counter;
  }, 0);
}

function textToWords(text: string) {
  return text.replace(/[|\\{}()[\]^$+*?.!,-;]/gm, '').split(' ');
}

export function computeTermFrequency(text: string) {
  const words = textToWords(text);
  return words.reduce<ITermFrequencyDictionary>((dictionary, word) => {
    if (!Object.keys(dictionary).some(key => new RegExp(word, 'gmi').test(key))) {
      dictionary[word] = count(word, words) / words.length;
    }
    return dictionary;
  }, {});
}
