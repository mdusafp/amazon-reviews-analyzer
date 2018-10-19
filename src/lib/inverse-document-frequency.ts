function isWordInText(word: string, text: string) {
  return new RegExp(word, 'gmi').test(text);
}

function countTextsWithWord(word: string, texts: Array<string>) {
  return texts.reduce<number>((counter, text) => {
    return isWordInText(word, text) ? counter + 1 : counter;
  }, 0);
}

export function computeInverseDocumentFrequency(word: string, texts: Array<string>) {
  return Math.log10(texts.length / countTextsWithWord(word, texts));
}
