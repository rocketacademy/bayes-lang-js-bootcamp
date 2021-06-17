const Bayes = function (Bayes) {
  // store the labels
  const storage = {};

  // Using sets
  const useSet = (arr) => {
    return [...new Set(arr)];
  };

  const stemKey = function (stem, label) {
    return "_Bayes::stem:" + stem + "::label:" + label;
  };
  const docCountKey = function (label) {
    return "_Bayes::docCount:" + label;
  };
  const stemCountKey = function (stem) {
    return "_Bayes::stemCount:" + stem;
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

  const getLabels = function () {
    let labels = storage["_Bayes::registeredLabels"];
    if (!labels) labels = "";
    return labels.split(",").filter(function (a) {
      return a.length;
    });
  };

  const registerLabel = function (label) {
    const labels = getLabels();
    if (labels.indexOf(label) === -1) {
      labels.push(label);
      storage["_Bayes::registeredLabels"] = labels.join(",");
    }
    return true;
  };

  const stemLabelCount = function (stem, label) {
    let count = parseInt(storage[stemKey(stem, label)]);
    if (!count) count = 0;
    return count;
  };
  const stemInverseLabelCount = function (stem, label) {
    const labels = getLabels();
    let total = 0;
    for (let i = 0, length = labels.length; i < length; i++) {
      if (labels[i] === label) continue;
      total += parseInt(stemLabelCount(stem, labels[i]));
    }
    return total;
  };

  const stemTotalCount = function (stem) {
    let count = parseInt(storage[stemCountKey(stem)]);
    if (!count) count = 0;
    return count;
  };
  const docCount = function (label) {
    let count = parseInt(storage[docCountKey(label)]);
    if (!count) count = 0;
    return count;
  };
  const docInverseCount = function (label) {
    const labels = getLabels();
    let total = 0;
    for (let i = 0, length = labels.length; i < length; i++) {
      if (labels[i] === label) continue;
      total += parseInt(docCount(labels[i]));
    }
    return total;
  };
  const increment = function (key) {
    let count = parseInt(storage[key]);
    if (!count) count = 0;
    storage[key] = parseInt(count) + 1;
    return count + 1;
  };

  const incrementStem = function (stem, label) {
    increment(stemCountKey(stem));
    increment(stemKey(stem, label));
  };

  const incrementDocCount = function (label) {
    return increment(docCountKey(label));
  };

  const train = function (text, label) {
    registerLabel(label);
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
    const labels = getLabels();
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
        log(label + "icity of " + word + ": " + wordicity);
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
