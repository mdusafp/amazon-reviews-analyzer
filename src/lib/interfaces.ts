export interface BaseDictionary {
  [key: string]: number;
}

export interface ImportanceDictionary extends BaseDictionary {}
export interface ITermFrequencyDictionary extends BaseDictionary {}
