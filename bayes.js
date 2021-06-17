const Bayes = function () {
  // store the labels
  // const storage = {};

  // Using sets
  const useSet = (arr) => {
    return [...new Set(arr)];
  };

  const log = function (text) {
    console.log(text);
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

  const stemLabelCount = function (stem, label) {
    let sK = stem + "::label:" + label;
    let count = parseInt(storage.stems[sK]);
    if (!count) count = 0;
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
    let count = parseInt(storage.stemCount[stem]);
    console.log('stem total count', stem, count );
    if (!count) count = 0;
    return count;
  };
  const docCount = function (label) {
    let count = parseInt(storage.docCount[label]);
    if (!count) count = 0;
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

    let count = parseInt(storage.stemCount[stem]);
    if (!count) count = 0;
    storage.stemCount[stem] = parseInt(count) + 1;

    let sK = stem + "::label:" + label;
    count = parseInt(storage.stems[sK]);
    if (!count) count = 0;
    storage.stems[sK] = parseInt(count) + 1;
  };

  const incrementDocCount = function (label) {
    let count = parseInt(storage.docCount[label]);
    if (!count) count = 0;
    storage.docCount[label] = parseInt(count) + 1;
    return count + 1;
  };

  const train = function (text, label) {

    if( storage.labels.includes( label ) === false ){
      storage.labels.push(label);
    }

    const words = tokenize(text);
    let length = words.length;
    for (let i = 0; i < length; i++) {
      incrementStem(words[i], label);
    }
    incrementDocCount(label);
  };

  const guess = function (text) {
    const words = tokenize(text);
    let length = words.length;
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

    for (let j = 0; j < labels.length; j++) {
      let label = labels[j];
      let logSum = 0;
      let wordicity = 0;
      labelProbability[label] = docCounts[label] / totalDocCount;

      for (let i = 0; i < length; i++) {
        let word = words[i];
        let _stemTotalCount = stemTotalCount(word);
        if (_stemTotalCount === 0) {
          continue;
        } else {
          let wordProbability = stemLabelCount(word, label) / docCounts[label];

          let wordInverseProbability =
            stemInverseLabelCount(word, label) / docInverseCounts[label];
          wordicity =
            wordProbability / (wordProbability + wordInverseProbability);

          wordicity =
            (1 * 0.5 + _stemTotalCount * wordicity) / (1 + _stemTotalCount);
          if (wordicity === 0) wordicity = 0.01;
          else if (wordicity === 1) wordicity = 0.99;
        }

        logSum += Math.log(1 - wordicity) - Math.log(wordicity);
        console.log(label + "icity of " + word + ": " + wordicity);
      }
      scores[label] = 1 / (1 + Math.exp(logSum));
    }
    return scores;
  };

  const extractWinner = function (scores) {
    let bestScore = 0;
    let bestLabel = null;
    for (let label in scores) {
      if (scores[label] > bestScore) {
        bestScore = scores[label];
        bestLabel = label;
      }
    }
    return { label: bestLabel, score: bestScore };
  };

  return {
    train,
    guess,
    extractWinner,
  };
};
