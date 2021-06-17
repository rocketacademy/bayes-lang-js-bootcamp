var storage = {};
const { train, guess, extractWinner } = Bayes();

document.querySelector("#test_button").addEventListener("click", function () {
  let text = document.getElementById("test_phrase").value;
  let scores = guess(text);
  let winner = extractWinner(scores);
  document.getElementById("test_result").innerHTML = winner.label;
  document.getElementById("test_probability").innerHTML = winner.score;
  console.log(scores);
});
