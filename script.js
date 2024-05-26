let questions = [];
let currentQuestionIndex = 0;
let score = 0;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('start-button').disabled = false;
});

async function fetchQuestions(category = 'any', difficulty = 'medium'){
  showPreloader(true);
  let url = `https://opentdb.com/api.php?amount=10&difficulty=${difficulty}`;
  if (category !== 'any') {
    url += `&category=${category}`;
  }
  const response = await fetch(url);
  const data = await response.json();
  questions = data.results;
  currentQuestionIndex = 0;
  score = 0;
  document.getElementById('score').innerText = score;
  document.getElementById('total-questions').innerText = questions.length;
  document.getElementById('remaining-questions').innerText = questions.length - currentQuestionIndex;
  loadQuestion();
  showPreloader(false);
  triggerFlash();
}

function showPreloader(show){
  const preloader = document.getElementById('preloader');
  const nextButton = document.getElementById('next-button');
  const infoContainer = document.getElementById('info-container');
  const gameScreen = document.getElementById('game-screen');
  preloader.style.display = show ? 'block' : 'none';
  nextButton.style.display = show ? 'none' : 'inline-block';
  infoContainer.style.display = show ? 'none' : 'block';
  gameScreen.style.display = show ? 'none' : 'block';
}

function triggerFlash(){
  const flashScreen = document.createElement('div');
  flashScreen.className = 'flash';
  document.body.appendChild(flashScreen);
  setTimeout(() => {
    document.body.removeChild(flashScreen);
  }, 500);
}

function startGame(){
  const category = document.getElementById('trivia-category').value;
  const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
  document.getElementById('start-screen').style.display = 'none';
  fetchQuestions(category, difficulty);
}

function decodeHtmlEntities(text){
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

function loadQuestion(){
  const questionContainer = document.getElementById('question-container');
  questionContainer.innerHTML = '';

  if (currentQuestionIndex >= questions.length) {
    showScore();
    return;
  }

  const question = questions[currentQuestionIndex];
  const questionElement = document.createElement('div');
  questionElement.innerHTML = `<h2>${decodeHtmlEntities(question.question)}</h2>`;
  questionContainer.appendChild(questionElement);

  const answers = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);
  answers.forEach(answer => {
    const button = document.createElement('button');
    button.innerHTML = decodeHtmlEntities(answer);
    button.onclick = () => selectAnswer(button, answer, question.correct_answer);
    questionContainer.appendChild(button);
  });

  document.getElementById('remaining-questions').innerText = questions.length - currentQuestionIndex - 1;
  updateProgress();
}

function selectAnswer(button, selected, correct){
  const buttons = document.querySelectorAll('#question-container button');
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.innerHTML === decodeHtmlEntities(correct)) {
      btn.classList.add('correct');
    } else if (btn.innerHTML === decodeHtmlEntities(selected)) {
      btn.classList.add('incorrect');
    }
  });

  if (selected === correct) {
    score++;
    document.getElementById('score').innerText = score;
    showFeedback('Correct!', 'correct');
  } else {
    showFeedback('Incorrect!', 'incorrect');
  }

  document.getElementById('next-button').disabled = false;
}

function loadNextQuestion(){
  currentQuestionIndex++;
  document.getElementById('next-button').disabled = true;
  loadQuestion();
}

function showScore(){
  const questionContainer = document.getElementById('question-container');
  questionContainer.innerHTML = `<h2>You've completed the quiz!</h2><p>Your final score is ${score} out of ${questions.length}</p>`;
  document.getElementById('next-button').style.display = 'none';
  const restartButton = document.createElement('button');
  restartButton.innerHTML = 'Restart Game';
  restartButton.onclick = restartGame;
  questionContainer.appendChild(restartButton);
}

function restartGame(){
  document.getElementById('game-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'block';
}

function showFeedback(message, className){
  const feedback = document.createElement('div');
  feedback.className = `feedback ${className}`;
  feedback.innerText = message;
  document.getElementById('question-container').appendChild(feedback);
  setTimeout(() => {
    feedback.remove();
  }, 1000);
}

function updateProgress(){
  const progress = document.getElementById('progress');
  const percentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  progress.style.width = `${percentage}%`;
}
