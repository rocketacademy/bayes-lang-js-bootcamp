const Bayes = function () {
  // store the labels
  // const storage = {};

  // Using sets
  const useSet = (arr) => {
    return [...new Set(arr)];
  };

  const tokenize = function (text) {
    text = text
      .toLowerCase()
      .replace(/\W/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ");

    // useSet de-duplicates words
    return useSet(text);
  };

  const compositeStemLabelKey = (stem, label) => {
    return stem + "::label:" + label;
  };

  const stemLabelCount = function (stem, label) {
    let stemLabelKey = compositeStemLabelKey(stem, label);
    let count = parseInt(storage.stems[stemLabelKey]) || 0;
    return count;
  };

  const stemInverseLabelCount = function (stem, label) {
    const labels = storage["labels"];
    let total = 0;
    for (let i = 0, length = labels.length; i < length; i++) {
      if (labels[i] === label) continue;
      total += parseInt(stemLabelCount(stem, labels[i]));
    }
    return total;
  };

  const stemTotalCount = function (stem) {
    let count = parseInt(storage.stemCount[stem]) || 0;
    return count;
  };

  const docCount = function (label) {
    let count = parseInt(storage.docCount[label]) || 0;
    return count;
  };

  const docInverseCount = function (label) {
    const labels = storage["labels"];
    let total = 0;
    for (let i = 0, length = labels.length; i < length; i++) {
      if (labels[i] === label) continue;
      total += parseInt(docCount(labels[i]));
    }
    return total;
  };

  const incrementStem = function (stem, label) {
    // store the absolute word count
    // the number of times a word appears in *all* the training data
    let count = parseInt(storage.stemCount[stem]) || 0;
    storage.stemCount[stem] = parseInt(count) + 1;

    // store the word associated with this label
    // the number of times this word appears in each document / label per training

    // this composite key tracks one unique key for each label - word pair
    let stemLabelKey = compositeStemLabelKey(stem, label);
    count = parseInt(storage.stems[stemLabelKey]) || 0;
    storage.stems[stemLabelKey] = parseInt(count) + 1;
  };

  const incrementDocCount = function (label) {
    let count = parseInt(storage.docCount[label]) || 0;
    storage.docCount[label] = count + 1;
  };

  const train = function (text, label) {
    if (storage.labels.includes(label) === false) {
      storage.labels.push(label);
    }

    const words = tokenize(text);
    let length = words.length;
    for (let i = 0; i < length; i++) {
      incrementStem(words[i], label);
    }
    incrementDocCount(label);
  };

  const labelGuess = (
    words,
    totalDocCount,
    docCounts,
    docInverseCounts,
    label
  ) => {
    let logSum = 0;
    let labelProbability = docCounts[label] / totalDocCount;

    // for every word in the input
    for (let i = 0; i < words.length; i++) {
      let word = words[i];
      let result = wordGuess(
        word,
        label,
        docCounts[label],
        docInverseCounts[label]
      );

      if (result !== null) {
        logSum += result;
      }
    }

    // change the log back to floating point num
    let labelResult = 1 / (1 + Math.exp(logSum));

    // return a readable number
    return labelResult.toFixed(10);
  };

  const wordGuess = (word, label, docLabelCount, docInverseLabelCount) => {
    let wordicity = 0;
    let _stemTotalCount = stemTotalCount(word);

    // if this word isn't in the training data, skip over it
    if (_stemTotalCount === 0) {
      return null;
    }

    let wordProbability = stemLabelCount(word, label) / docLabelCount;

    let wordInverseProbability =
      stemInverseLabelCount(word, label) / docInverseLabelCount;
    wordicity = wordProbability / (wordProbability + wordInverseProbability);

    // adjust for rare words
    // wordicity =
    //  (1 * 0.5 + _stemTotalCount * wordicity) / (1 + _stemTotalCount);

    // log calculation won't like 0 or 1. adjust these values
    if (wordicity === 0) {
      wordicity = 0.01;
    } else if (wordicity === 1) {
      wordicity = 0.99;
    }

    // probability of this word being the label (language )
    let result = Math.log(1 - wordicity) - Math.log(wordicity);
    console.log(label + "icity of " + word + ": " + wordicity);
    return result;
  };

  const guess = (text) => {
    const words = tokenize(text);
    const labels = storage["labels"];
    let totalDocCount = 0;
    const docCounts = {};
    const docInverseCounts = {};
    const scores = {};
    const labelProbability = {};

    for (let j = 0; j < labels.length; j++) {
      let label = labels[j];
      docCounts[label] = docCount(label);
      docInverseCounts[label] = docInverseCount(label);
      totalDocCount += parseInt(docCounts[label]);
    }

    // for each language
    for (let j = 0; j < labels.length; j++) {
      let label = labels[j];

      // calculate a score for the group of words
      scores[label] = labelGuess(
        words,
        totalDocCount,
        docCounts,
        docInverseCounts,
        label
      );
    }
    return scores;
  };

  return {
    train,
    guess,
  };
};
