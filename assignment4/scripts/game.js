
class Game {

    constructor() {
        this.reset();
        this._board = {
            question: "quizQuestion",
            answers: "answerChoices",
            time: "timeRemaining",
        }
    }

    // --- set/get properties ---
    get sessionTimeRemaining() {
        if (this._sessionTimeRemaining < 0) {
            this.sessionTimeRemaining(0);
        }
        return this._sessionTimeRemaining;
    }

    set sessionTimeRemaining(time) {
        this.sessionTimeRemaining = time;
    }

    // --- Set up ---
    reset() {

        this._config = quizConfig;

        this._quiz = new Quiz();

        this._questionCount = 0;
        this._totalScore = 0;

        this._sessionTimer = null;
        this._questionTimeRemaining = this._config.questionTimeLimit;
        this._sessionTimeRemaining = this._questionTimeRemaining * this._config.maxQuestionsPerSession;


        this.setSoundSystem();
    }

    // set up Buzz sound 
    setSoundSystem(name = "") {
        let sound;

        if (!name || this._config.sounds.some(sound => sound.name !== name)) {
            //if no name is given or name is not in the list, use default
            name = this._config.defaultSound;
        }
        sound = this._config.sounds.filter(sound => sound.name === name)[0];
        // this._buzzSound = new Audio(sound.url); //TODO not working with commandline to test it with browser
    }

    //
    checkIfMaxQuestion() {
        return this._questionCount === this._config.maxQuestionsPerSession;
    }
    // game activities
    start() {
        console.log("start")
        this.next();
        this.updateTime();
        this.sessionTimer = setInterval(() => {
            if (this.sessionTimeRemaining === 0) {
                //session time has run out, end this quiz
                this.end();
                return false;
            }
            if (this._questionTimeRemaining === 0) {
                // time up to answer a question
                // unanswer question is counted as incorrect 
                // so calculate the score
                this.calculateScore(false);
                // so change to next one
                this.next();
            }
            //time countdown
            this._questionTimeRemaining--;
            this._sessionTimeRemaining--;
            this.updateTime();
        }, 1000);
    }

    renderQuiz(quiz) {
        let answersContainer = document.getElementById(this._board.answers);
        let choiceElement;

        //display question
        document.getElementById(this._board.question).textContent = quiz.title;

        // display choices 
        // first clean up the container in case there are something. 
        answersContainer.innerHTML = "";

        quiz.choices.forEach(choice => {
            choiceElement = document.createElement("button");
            choiceElement.textContent = choice;
            choiceElement.classList.add("choice");
            answersContainer.appendChild(choiceElement);
        });
    }

    updateTime() {
        document.getElementById(this._board.time).textContent = this.sessionTimeRemaining;
    }

    next() {
        // check if user completed max number of questions
        if (this.checkIfMaxQuestion()) {
            //if yes, end this game
            this.end();
            return false;
        }
        // reset question time limit
        this._questionTimeRemaining = this._config.questionTimeLimit;
        // increase the question count 
        this._questionCount++;
        this.renderQuiz(this._quiz.question);
    }

    calcutateFinalScore() {
        if ( this._questionCount < this._config.maxQuestionsPerSession) {
            // there are some unanswer questions
            // any unanswer question is counted as incorrect
            this._totalScore -= ( this._config.maxQuestionsPerSession - this._questionCount) * this._config.penaltyForIncorrectAnswer;
        }

        if ( this._totalScore < 0 ) {
            //force total score to 0 so that we don't have negative scores
            this._totalScore = 0; 
        }
    }

    calculateScore(isCorrect) {
        if (isCorrect === true) {
            //if answer is correct 
            this._totalScore += this._config.awardForCorrectAnswer + this._questionTimeRemaining;
        } else if (isCorrect === false) {
            // wrong answer
            this._totalScore -= this._config.penaltyForIncorrectAnswer;
        }
    }

    markAnswer(title, userAnswer) {
        let question = this._quiz.getThisQuestion(title.trim());
        let isCorrect = question.answer.trim() === userAnswer.trim() ? true : false;
        this.calculateScore(isCorrect);
        return isCorrect;
    }

    end() {
        //clear timer
        clearInterval(this.sessionTimer);
        // calcuate final score in case there are some unanswered questions. 
        this.calcutateFinalScore();
        //return the result. //TODO 
        return this._totalScore;
    }
}

myQuiz = new Game(quizConfig);


// ----- Quiz -----
//time limit for each question: 15sec
//max questions: 5
//max time limit : maxquestion * timeLimit (75sec)
// penaltyForIncorrectAnswer: 10 sec


//    ---- Start quiz - steps ----
//     when User click "start quiz" button,....
//     1. hide landing page
//     2. set display time from 0 to Session_time
//     3. create a count-down timer 
//         a. with 1 sec interval 
//         b. reduce timeRemaining by 1 for each second and update displaytime
//         c. if user chose an answer or every [15 second] change the question
//         d. clear the interval 
//             1. when user answers all questions if questionCount === NO_OF_QUESTIONS_PER_SESSION 
//             2. when timeRemaining is 0
//     4. create a fucntion to render Quiz
//         a. get questions
//         b. use Math.random to choose which question to use
//         c. once we get question index
//             1. get quizQuestion to add question.title
//             2. populate answerChoices with questions.answers(a href with button class)
//         d. add eventListener for click event of answerChoices
//             1. get which answer is chosen. 
//             2. check if answer is correct by comparing with question.answer
//             3. if wrong, incorrectAnswerCount + 1
//             4. render another quiz
//     5. when time is run out or user complete all questions,
//         a. calculate score = timeRemaining - (incorrectAnswerCount * PENALTY_FOR_INCORRECT_ANSWER)
//         b. present the user with the score. resultViewContainer
//     6. In result page, when user click submit button
//         a. check if initials are given. 
//         b. if no, then show the error message
