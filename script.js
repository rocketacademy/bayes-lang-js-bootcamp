var storage = {
  stemCount: {},
  docCount: {},
  stems: {},
  labels: [],
};
const { train, guess, extractWinner } = Bayes();

/*
 * =======================================================
 * =======================================================
 * =======================================================
 * =======================================================
 *                 guessing
 * =======================================================
 * =======================================================
 * =======================================================
 * =======================================================
 */

document.querySelector("#test_button").addEventListener("click", function () {
  let text = document.getElementById("test_phrase").value;
  let scores = guess(text);

  let fullResult = Object.keys(scores).map(
    (key, index) => `${key} : ${scores[key]}<br/>`
  );
  document.getElementById("test_full_results").innerHTML = fullResult.join("");
  console.log(scores);
});

/*
 * =======================================================
 * =======================================================
 * =======================================================
 * =======================================================
 *                 training
 * =======================================================
 * =======================================================
 * =======================================================
 * =======================================================
 */

document.querySelector("#train_button").addEventListener("click", function () {
  let textArea = document.getElementById("train_phrase");
  let language = document.getElementById("language").value;
  let text = textArea.value;
  train(text, language);
  textArea.value = "";
});

doTraining();
