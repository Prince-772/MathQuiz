
const get = (func, n, dp) => {
    let result = func(n);
    return parseFloat(result.toFixed(dp));
};

const getRangeArray = (start, end) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};


const f_m = {
    '1': ["Square", (y) => y * y, 3],
    '2': ["Cube", (y) => y ** 3, 3],
    '3': ["Square Root", Math.sqrt, 3],
    '4': ["Log Base e (ln)", Math.log, 3],
    '5': ["Log Base 10", Math.log10, 3],
    '6': ['Inverse', (x) => 1 / x, 4]
};


let state = {
    mode: null,
    modeKey: null,
    from_v: 0,
    to_v: 0,
    nums: [],
    current_index: 0,
    score: 0,
    total_answered: 0,
    isAnswerCorrect: false,
};


const DOMElements = {
    body: document.body,
    screens: {
        mode: document.getElementById('mode-selection'),
        range: document.getElementById('range-input'),
        quiz: document.getElementById('quiz-screen'),
        results: document.getElementById('results-screen')
    },
    modeButtons: document.getElementById('mode-buttons'),
    modeContinueBtn: document.getElementById('mode-continue-btn'),
    range: {
        start: document.getElementById('start-value'),
        end: document.getElementById('end-value'),
        error: document.getElementById('range-error'),
        startBtn: document.getElementById('start-quiz-btn'),
        backBtn: document.getElementById('back-to-mode-btn')
    },
    quiz: {
        title: document.getElementById('quiz-title'),
        score: document.getElementById('current-score'),
        total: document.getElementById('total-questions'),
        funcName: document.getElementById('function-name'),
        currentNum: document.getElementById('current-number'),
        answerInput: document.getElementById('user-answer'),
        submitBtn: document.getElementById('submit-answer-btn'),
        feedback: document.getElementById('feedback-msg'),
        exitBtn: document.getElementById('exit-quiz-btn'),
        skipBtn: document.getElementById('skip-question-btn'),
        localFlash: document.getElementById('local-feedback-flash')
    },
    results: {
        scoreValue: document.getElementById('final-score-value'),
        totalValue: document.getElementById('final-total-value'),
        playAgainBtn: document.getElementById('play-again-btn')
    },
    themeToggle: document.getElementById('theme-toggle')
};


const flashUI = (isCorrect) => {
    const flashElement = DOMElements.quiz.localFlash;
    const type = isCorrect ? 'correct' : 'wrong';
    const message = isCorrect ? '✅' : '❌';


    flashElement.textContent = message;
    flashElement.classList.remove('correct', 'wrong', 'hidden');
    flashElement.classList.add(type);
    

    void flashElement.offsetWidth;
    flashElement.classList.add('active');

    setTimeout(() => {
        flashElement.classList.remove('active');
        
        setTimeout(() => {
            flashElement.classList.add('hidden');
        }, 100); 
    }, 500);
};

const showScreen = (targetScreen) => {
    Object.values(DOMElements.screens).forEach(screen => {
        if (screen === targetScreen) {
            screen.classList.remove('hidden');
            screen.classList.add('active');
        } else {
            screen.classList.remove('active');
            screen.classList.add('hidden');
        }
    });
    if (targetScreen === DOMElements.screens.quiz) {
        DOMElements.quiz.answerInput.focus();
    }
};

const createModeButtons = () => {
    DOMElements.modeButtons.innerHTML = '';
    for (const key in f_m) {
        const modeData = f_m[key];
        const button = document.createElement('button');
        button.textContent = `${key}: ${modeData[0]}`;
        button.dataset.modeKey = key;
        button.addEventListener('click', () => highlightMode(key, button));
        DOMElements.modeButtons.appendChild(button);
    }
};

const highlightMode = (key, button) => {
    const allButtons = DOMElements.modeButtons.querySelectorAll('button');
    allButtons.forEach(btn => btn.classList.remove('selected'));

    button.classList.add('selected');
    
    state.mode = f_m[key];
    state.modeKey = key;

    DOMElements.modeContinueBtn.classList.remove('hidden');
    DOMElements.modeContinueBtn.disabled = false;
};

const continueToRange = () => {
    if (!state.mode) return;
    DOMElements.range.error.textContent = '';
    showScreen(DOMElements.screens.range);
};

const validateRangeInputs = (changedId, changedValue) => {
    DOMElements.range.error.textContent = '';
};

const handleStartQuiz = () => {
    validateRangeInputs('start-quiz-btn', 0);

    const from_v = parseInt(DOMElements.range.start.value);
    const to_v = parseInt(DOMElements.range.end.value);

    if (from_v < 1 || to_v <= from_v || isNaN(from_v) || isNaN(to_v)) {
        DOMElements.range.error.textContent = "Please ensure Starting Value ≥ 1 and Ending Value > Starting Value!";
        return;
    }

    state.from_v = from_v;
    state.to_v = to_v;
    setupQuiz();
    showScreen(DOMElements.screens.quiz);
};

const setupQuiz = () => {
    state.nums = getRangeArray(state.from_v, state.to_v);
    shuffleArray(state.nums);
    state.current_index = 0;
    state.score = 0;
    state.total_answered = 0;
    state.isAnswerCorrect = false;

    DOMElements.quiz.title.textContent = `Mode: ${state.mode[0]}`;
    DOMElements.quiz.skipBtn.classList.add('hidden');

    updateScoreDisplay();
    displayQuestion();
};

const updateScoreDisplay = () => {
    DOMElements.quiz.score.textContent = state.score;
    DOMElements.quiz.total.textContent = state.total_answered;
};

const displayQuestion = () => {
    DOMElements.quiz.feedback.classList.add('hidden'); 
    DOMElements.quiz.skipBtn.classList.add('hidden');
    DOMElements.quiz.localFlash.classList.add('hidden'); 
    DOMElements.quiz.submitBtn.disabled = false;
    DOMElements.quiz.answerInput.disabled = false;

    if (state.current_index >= state.nums.length) {
        return handleQuizEnd(false);
    }

    const currentNumber = state.nums[state.current_index];
    const dp = state.mode[2];
    
    DOMElements.quiz.answerInput.placeholder = `Answer (to ${dp} decimal place${dp !== 1 ? 's' : ''})`;

    DOMElements.quiz.funcName.textContent = state.mode[0];
    DOMElements.quiz.currentNum.textContent = currentNumber;
    DOMElements.quiz.answerInput.value = '';
    DOMElements.quiz.answerInput.focus();
};

const handleSubmitAnswer = () => {
    const userInput = DOMElements.quiz.answerInput.value.trim();
    
    if (userInput === '') {
        DOMElements.quiz.feedback.textContent = 'Please enter an answer.';
        DOMElements.quiz.feedback.classList.remove('hidden');
        DOMElements.quiz.answerInput.focus();
        return;
    }

    const userAnswer = parseFloat(userInput);
    const currentNumber = state.nums[state.current_index];
    const func = state.mode[1];
    const dp = state.mode[2];
    
    const multiplier = Math.pow(10, dp);
    const correct_ans_rounded = get(func, currentNumber, dp);
    
    const correct_check_val = Math.round(correct_ans_rounded * multiplier);
    const user_check_val = Math.round(userAnswer * multiplier);

    DOMElements.quiz.submitBtn.disabled = true;
    DOMElements.quiz.answerInput.disabled = true;

    if (user_check_val === correct_check_val) {
        
        state.score++;
        state.isAnswerCorrect = true;
        
        flashUI(true); 
        
        setTimeout(handleNextQuestion, 500); 
    } else {
        state.isAnswerCorrect = false;
        
        flashUI(false);        
        setTimeout(() => {
            const exactAnswer = correct_ans_rounded; 
            DOMElements.quiz.feedback.textContent = `The correct answer is ${exactAnswer}.`;
            DOMElements.quiz.feedback.classList.remove('hidden'); 
            DOMElements.quiz.skipBtn.classList.remove('hidden');
        }, 500);
    }
    
    state.total_answered++; 
    updateScoreDisplay();
};

const handleNextQuestion = () => {
    state.current_index++;
    displayQuestion();
}

const handleQuizEnd = (isExit = false) => {
    if (isExit) {
        state.total_answered = state.current_index;
    }

    DOMElements.results.scoreValue.textContent = state.score;
    DOMElements.results.totalValue.textContent = state.total_answered;
    
    showScreen(DOMElements.screens.results);
};

const toggleTheme = () => {
    DOMElements.body.classList.toggle('dark-theme');
    const isDark = DOMElements.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        DOMElements.body.classList.add('dark-theme');
        DOMElements.themeToggle.checked = true;
    } else {
        DOMElements.body.classList.remove('dark-theme');
        DOMElements.themeToggle.checked = false;
    }
};



const init = () => {
    loadTheme();
    createModeButtons();
    showScreen(DOMElements.screens.mode);

    DOMElements.themeToggle.addEventListener('change', toggleTheme);
    
    DOMElements.modeContinueBtn.addEventListener('click', continueToRange);

    DOMElements.range.startBtn.addEventListener('click', handleStartQuiz);
    DOMElements.range.backBtn.addEventListener('click', () => {
        const allButtons = DOMElements.modeButtons.querySelectorAll('button');
        allButtons.forEach(btn => btn.classList.remove('selected'));
        DOMElements.modeContinueBtn.classList.add('hidden');
        DOMElements.modeContinueBtn.disabled = true;
        showScreen(DOMElements.screens.mode);
    });

    DOMElements.quiz.submitBtn.addEventListener('click', handleSubmitAnswer);
    DOMElements.quiz.skipBtn.addEventListener('click', handleNextQuestion);
    DOMElements.quiz.exitBtn.addEventListener('click', () => handleQuizEnd(true)); 
    
    DOMElements.quiz.answerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!DOMElements.quiz.submitBtn.disabled) {
                handleSubmitAnswer();
            } else if (!DOMElements.quiz.skipBtn.classList.contains('hidden')) {
                handleNextQuestion();
            }
        }
    });

    DOMElements.results.playAgainBtn.addEventListener('click', () => {
        showScreen(DOMElements.screens.mode);
    });
};

document.addEventListener('DOMContentLoaded', init);