// For settings dialogues box
const startGameBtn = document.getElementById('startGame');
const navBar = document.getElementsByClassName("nav-bar")[0];
const navBarLeft = document.getElementsByClassName("nav-left")[0];
const retroWindow = document.getElementsByClassName("retro-window")[0];

let score = 0;
let lives = 3;
let questions = [];
let gameSettings = {};
let currentQuestionIndex = 0
let timeRemaining = 30
let timer;
let gameOver = false;

startGameBtn.addEventListener('click', function(){
    retroWindow.style.display = "block";
    navBar.style.pointerEvents = "none";
})



const okBtn = document.getElementsByClassName("ok-btn")[0];
// or we can use -> const element = document.querySelector(".your-class-name"); syntax for single classname element

function showAlert(message){
    const messagebox = document.getElementsByClassName("alert-msg")[0];
    messagebox.querySelector('p').textContent = message
    messagebox.style.display = "flex"; 
    messagebox.querySelector('button').addEventListener('click', function(){
    messagebox.style.display = "none";
    })
}

okBtn.addEventListener('click', function(){
    console.log("Getting Users settings");

    const username = document.getElementById('username').value;
    const difficultySelect = document.getElementById('difficulty').value;
    const categorySelect = document.getElementById('category').value
    const questionCountSelect = document.getElementById('questionCount').value;

    // Putting all the user's answers in one organized "box" (called an object):
    // Defining the object to save those data
    const settings = {
        username: username,
        difficulty: difficultySelect,
        category: categorySelect,
        qnCount: questionCountSelect
    }
    // Input Validation 
    // Check if username is empty
    if (username.trim() === ""){
        showAlert("Please enter your username!");
        return
        
    }
    navBarLeft.style.pointerEvents = "auto";
    gameSettings = settings;
    console.log(settings);
    startQuiz(settings)
    const settingsUI = document.getElementsByClassName("settingsUI")[0];
    settingsUI.style.display = "none";

})



function startQuiz(settings){
    console.log(settings)
    // https://opentdb.com/api.php?amount=15&category=27&difficulty=medium&type=multiple
    const apiUrl = (`https://opentdb.com/api.php?amount=${settings.qnCount}&category=${settings.category}&difficulty=${settings.difficulty.toLowerCase()}&type=multiple`)
    console.log(apiUrl)
    // gameSettings = settings;
    // Fetching the API content

    try{
        let promise = fetch(apiUrl)
        .then((response) => {
            return response.json()
        }).then((questionsData) =>{

            // check if questions loaded successfully
            if (questionsData.results && questionsData.results.length > 0){
                console.log("Success! Got", questionsData.results.length, "questions");
                
                // start displaying questions
                console.log("Questions Data: ", questionsData);
                // Storing questionsData in global var questions
                questions = questionsData.results;
                questions = questions.map(q => ({
                    ...q,
                    question: decodeHTMLEntities(q.question),
                    correct_answer: decodeHTMLEntities(q.correct_answer),
                    incorrect_answers: q.incorrect_answers.map(ans => decodeHTMLEntities(ans)) 
                })); 

                // console.log(questionsData.results[0].question) 
                // console.log(questions) 

                // Displaying Game Interface , passing questions object
                showGameInterface()
                // startTimer();
            }
            else{
                showAlert("Sorry, couldn't get questions. Try again!");
            }

        })
    }catch(error){
        console.error('Error:', error);
        showAlert("Check your internet connection and try again!");
    }
    
}
 
function decodeHTMLEntities(text) {
    // converts "What is the purpose of the &lt;head&gt; tag in HTML?" to "What is the purpose of the <head> tag in HTML?"
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}


function showGameInterface(){
    if (gameOver) return;

    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }
    
    // Gamer Logics
    const gameInterface =  document.getElementsByClassName("game")[0];
    gameInterface.style.display = "block";
    
    const question = questions[currentQuestionIndex];
    // Create all answers array and shuffle
    const allAnswers = [...question.incorrect_answers, question.correct_answer];
    const shuffledAnswers = shuffleArray(allAnswers);
    // Reset timer
    timeRemaining = 30;
    startTimer()


    const statUsername = document.getElementById('stat-username');
    const statLives = document.getElementById('stat-lives');
    const statScore = document.getElementById('stat-score');
    const statTimeRemaining = document.getElementById('stat-Time-remaining');
    
    console.log('game', gameInterface);
    console.log('statusername: ', statUsername)  //Null ??
    console.log('game settings: ', gameSettings);
    statUsername.innerHTML = `👤 ${gameSettings.username}`;
    statLives.innerHTML = `⚔️ Lives: ${lives}`;
    statScore.innerHTML = `🏆 Score: ${score}`;
    statTimeRemaining.innerHTML = `⏰ Time: <span id="timer-display">${timeRemaining}</span>`

    displayQuestion(question, shuffledAnswers);

    // const statsDisplay = document.getElementsByClassName("stats-display")[0];
    // const optionsDisplay = document.getElementsByClassName("options-display")[0];
    
}

function shuffleArray(array) {
    const shuffled = [...array];     // Makes shallow copy
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; //Array Destructuring method to shuffle
    }
    return shuffled;
}

function displayQuestion(question, shuffledAnswers){
    console.log(question)
    const progressFill = document.getElementsByClassName("progress-fill")[0];
    const progressText = document.getElementsByClassName("progress-text")[0];
    progressFill.style.width = ((currentQuestionIndex + 1) / questions.length) * 100 + "%";

    progressText.innerHTML = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

    const questionText = document.getElementsByClassName("question-text")[0];
    questionText.innerHTML = question.question;

    
    // Display Answer options now
    const answersGrid = document.getElementsByClassName("answers-grid")[0];
    answersGrid.innerHTML = '';
    shuffledAnswers.forEach(answer => {
        const answerBtn = document.createElement("button");
        answerBtn.classList.add("answer-option");
        answerBtn.innerHTML = answer;
        // attach click event
        answerBtn.addEventListener("click", () => {
            handleAnswerClick(answer, question.correct_answer); 
        });
        // Add the button to the grid
        answersGrid.appendChild(answerBtn);
    });

    // Game Controls
    const gameControlDisplay = document.getElementsByClassName("game-controls")[0];
    console.log(gameControlDisplay)
    gameControlDisplay.innerHTML = `
            <button class="power-up-btn" id="skipBtn" onclick="useSkip()" ${lives <= 1 ? 'disabled' : ''}>
                ⏭️ Skip (Cost: 1 Life)
            </button>
            <button class="power-up-btn" onclick="useFiftyFifty()" id="fifty-fifty-btn">
                🎯 50/50
            </button>
            <button class="power-up-btn" onclick="phoneAFriend()" id="phone-a-frn">
                📞Phone A Friend
            </button>
    `;

}

function handleAnswerClick(selectedAnswer, correctAnswer){
    clearInterval(timer);
    const answerButtons = document.querySelectorAll('.answer-option');
    console.log(answerButtons)
    answerButtons.forEach(btn => btn.disabled = true);

    const isCorrect = selectedAnswer === correctAnswer;
    // Visual feedback
    answerButtons.forEach(btn => {
        if (btn.textContent.trim() === correctAnswer) {
            btn.style.backgroundColor = '#4CAF50'; // Green for correct
            btn.style.color = 'white';
        } else if (btn.textContent.trim() === selectedAnswer && !isCorrect) {
            btn.style.backgroundColor = '#f44336'; // Red for wrong selection
            btn.style.color = 'white';
        }
    });

    if (isCorrect) {
        // Calculate score based on difficulty and time
        let points = getPointsForDifficulty(gameSettings.difficulty);
        let timeBonus = Math.floor(timeRemaining / 2);
        score += points + timeBonus;
        
        showFeedback(`Correct! +${points + timeBonus} points`, 'success');
    }else{
        lives--;
        showFeedback(`Wrong! The correct answer was: ${correctAnswer}`, 'error');
        
        if (lives <= 0) {
            setTimeout(() => endGame(), 1000);
            return;
        }
    }
    setTimeout(() => {
        currentQuestionIndex++;
        showGameInterface()
    }, 1000);
}

function getPointsForDifficulty(difficulty) {
    switch(difficulty) {
        case 'easy': return 10;
        case 'medium': return 20;
        case 'hard': return 30;
        default: return 10;
    }
}

function showFeedback(message, type, time = 1000) {
    const existingFeedback = document.querySelector('.feedback-message');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    const feedback = document.createElement('div');
    feedback.className = `feedback-message ${type}`;
    feedback.textContent = message;
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, time);
}

function startTimer() {
    if (gameOver) return;
    timer = setInterval(() => {
        timeRemaining--;
        const timerDisplay = document.getElementById('stat-Time-remaining');
        if (timerDisplay) {
            // timerDisplay.textContent = timeRemaining;
            timerDisplay.innerHTML = `⏰ Time: <span id="timer-display">${timeRemaining}</span>`;
            
            if (timeRemaining <= 5) {
                timerDisplay.style.color = '#f44336'; // Red warning
            }
        }
        
        if (timeRemaining <= 0) {
            handleAnswerClick('', questions[currentQuestionIndex].correct_answer); // Auto-fail
            clearInterval(timer);
            // if (lives > 0 && lives <= 3){
            //     showGameInterface();
            // }
            // else{
            //     endGame()
            // }
        }
    }, 1000);
}

function useSkip() {
    document.getElementById('skipBtn').disabled = true;
    if (lives > 1) {
        lives--;
        clearInterval(timer);
        showFeedback('Question skipped! -1 Life', 'warning');
        setTimeout(() => {
            currentQuestionIndex++;
            showGameInterface();
        }, 1500);
    }
}
function useFiftyFifty() {
    const answerButtons = document.querySelectorAll('.answer-option');
    const correctAnswer = questions[currentQuestionIndex].correct_answer;
    const incorrectButtons = Array.from(answerButtons).filter(btn => 
        btn.textContent.trim() !== correctAnswer
    );
    
    // Remove 2 incorrect answers
    for (let i = 0; i < 2 && i < incorrectButtons.length; i++) {
        incorrectButtons[i].style.display = 'none';
    }
    
    // Disable the 50/50 button
    document.getElementById('fifty-fifty-btn').disabled = true;
    document.getElementById('fifty-fifty-btn').textContent = '🎯 Used';
}

function phoneAFriend() {
    const phoneAFriend = document.getElementById('phone-a-frn');
    showFeedback('This is not KBC, Get you ass back!', 'success', 2000)
    
}


function endGame() {
    gameOver = true;
    console.log("Entered endGame()");
    clearInterval(timer);
    const gameInterface = document.getElementsByClassName("game")[0];
    gameInterface.style.display = "none";
    const gameEnd = document.getElementsByClassName("game-end")[0];
    
    const isVictory = lives > 0;
    const finalScore = score;
    
    // Save high score
    saveHighScore(gameSettings.username, finalScore, gameSettings.difficulty, gameSettings.category);
    

    gameEnd.innerHTML = `
        <h1 class="${isVictory ? 'victory' : 'defeat'}">${isVictory ? '🏆 VICTORY!' : '💀 DEFEAT!'}</h1>
        <div class="final-stats">
            <h2>Warrior ${gameSettings.username}</h2>
            <p>Final Score: ${finalScore}</p>
            <p>Questions Answered: ${currentQuestionIndex} / ${questions.length}</p>
            <p>Category: ${gameSettings.category}</p>
            <p>Difficulty: ${gameSettings.difficulty.toUpperCase()}</p>
            <p>Lives Remaining: ${lives}</p>
        </div>
        <div class="end-buttons">
            <button class="btn" onclick="restartGame()">⚔️ Fight Again</button>
            <button class="btn" onclick="returnToMenu()">🏠 Main Menu</button>
            <button class="btn" onclick="showHighScores()">🏆 High Scores</button>
        </div>
    `;
    console.log("Game Ended here")
}

function saveHighScore(username, score, difficulty, category) {
    const highScores = JSON.parse(localStorage.getItem('quizHighScores') || '[]');
    highScores.push({
        username,
        score,
        difficulty,
        category,
        date: new Date().toLocaleDateString()
    });
    
    // Sort by score and keep top 10
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(10);
    
    localStorage.setItem('quizHighScores', JSON.stringify(highScores));
}

function restartGame() {
    gameEndUI = document.getElementsByClassName("game-end")[0];
    gameEndUI.innerHTML = '';
    currentQuestionIndex = 0;
    username = gameSettings.username;
    score = 0;
    lives = 3;
    gameOver = false;
    startQuiz(gameSettings);
}

function returnToMenu() {
    gameEndUI = document.getElementsByClassName("game-end")[0];
    gameEndUI.innerHTML = '';
    const gameInterface = document.getElementsByClassName("game")[0];
    const settingsUI = document.getElementsByClassName("settingsUI")[0];
    
    gameInterface.style.display = "none";
    settingsUI.style.display = "block";
    
    // Reset form
    document.getElementById('username').value = stringify(gameSettings.username);
    document.getElementById('category').value = '9';
    document.getElementById('difficulty').value = 'easy';
    document.getElementById('questionCount').value = '5';
}

function showHighScores() {
    const highScores = JSON.parse(localStorage.getItem('quizHighScores') || '[]');
    const gameEnd = document.getElementsByClassName("game-end")[0];
    const showHighScore = document.getElementById('showHighScore');
    gameEnd.style.display = "none";
    showHighScore.innerHTML = `
        <div class="high-scores">
            <h1>🏆 Hall of Fame</h1>
            <div class="scores-list">
                ${highScores.length > 0 ? 
                    highScores.map((score, index) => `
                        <div class="score-entry">
                            <span class="rank">#${index + 1}</span>
                            <span class="name">${score.username}</span>
                            <span class="points">${score.score} pts</span>
                            <span class="category"${score.category}</span>
                            <span class="difficulty">${score.difficulty}</span>
                            <span class="date">${score.date}</span>
                        </div>
                    `).join('') :
                    '<p>No high scores yet! Be the first warrior!</p>'
                }
            </div>
            <button class="btn" onclick="returnToMenu()">🏠 Main Menu</button>
        </div>
    `;
}
