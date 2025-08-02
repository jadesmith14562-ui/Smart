document.addEventListener('DOMContentLoaded', function() {
    const shareId = window.location.pathname.split('/').pop();
    let quizData = null;
    let studentName = '';
    let startTime = null;
    let timerInterval = null;
    let currentQuestionIndex = 0;
    let studentAnswers = [];
    let passages = {};

    const studentNameForm = document.getElementById('studentNameForm');
    const loadingContainer = document.getElementById('loadingContainer');
    const quizContainer = document.getElementById('quizContainer');
    const resultsContainer = document.getElementById('resultsContainer');
    const errorContainer = document.getElementById('errorContainer');
    
    const quizTitle = document.getElementById('quizTitle');
    const quizSubject = document.getElementById('quizSubject');
    const currentQuestionNum = document.getElementById('currentQuestionNum');
    const totalQuestions = document.getElementById('totalQuestions');
    const questionNumber = document.getElementById('questionNumber');
    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const questionIndicators = document.getElementById('questionIndicators');
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    const timerDisplay = document.getElementById('timerDisplay');
    const timeRemaining = document.getElementById('timeRemaining');

    document.getElementById('nameForm').addEventListener('submit', startQuiz);
    prevBtn.addEventListener('click', previousQuestion);
    nextBtn.addEventListener('click', nextQuestion);
    submitBtn.addEventListener('click', submitQuiz);

    async function startQuiz(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        studentName = formData.get('studentName');
        
        if (!studentName.trim()) {
            alert('Please enter your name');
            return;
        }

        studentNameForm.classList.add('hidden');
        loadingContainer.classList.remove('hidden');

        try {
            const response = await fetch(`/api/quiz/${shareId}`);
            
            if (!response.ok) {
                throw new Error('Quiz not found');
            }

            quizData = await response.json();
            startTime = Date.now();
            
            if (quizData.passages) {
                quizData.passages.forEach(passage => {
                    passages[passage.id] = passage;
                });
            }
            
            studentAnswers = new Array(quizData.questions.length).fill(null);
            
            loadingContainer.classList.add('hidden');
            initializeQuiz();
            
            if (quizData.timeLimit > 0) {
                startTimer(quizData.timeLimit * 60);
            }
            
        } catch (error) {
            loadingContainer.classList.add('hidden');
            errorContainer.classList.remove('hidden');
        }
    }

    function initializeQuiz() {
        quizContainer.classList.remove('hidden');
        
        quizTitle.textContent = quizData.title;
        quizSubject.textContent = `Subject: ${quizData.subject}`;
        totalQuestions.textContent = quizData.questions.length;
        
        if (quizData.timeLimit > 0) {
            quizSubject.innerHTML += `<br><small>Time Limit: ${quizData.timeLimit} minutes</small>`;
            timerDisplay.style.display = 'block';
        }
        
        createQuestionIndicators();
        displayQuestion(0);
        updateNavigation();
    }

    function createQuestionIndicators() {
        questionIndicators.innerHTML = '';
        
        for (let i = 0; i < quizData.questions.length; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'question-indicator';
            indicator.textContent = i + 1;
            indicator.addEventListener('click', () => goToQuestion(i));
            questionIndicators.appendChild(indicator);
        }
    }

    function displayQuestion(index) {
        if (index < 0 || index >= quizData.questions.length) return;
        
        currentQuestionIndex = index;
        const question = quizData.questions[index];
        
        currentQuestionNum.textContent = index + 1;
        questionNumber.textContent = index + 1;
        questionText.innerHTML = question.question;
        
        if (question.imageUrl) {
            questionText.innerHTML += `<br><img src="${question.imageUrl}" class="question-image" alt="Question image">`;
        }
        
        const progress = ((index + 1) / quizData.questions.length) * 100;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `Question ${index + 1} of ${quizData.questions.length}`;
        
        displayReadingPassage(question);
        displayOptions(question.options, index);
        updateQuestionIndicators();
        updateNavigation();
        
        document.querySelector('.question-content').style.animation = 'none';
        setTimeout(() => {
            document.querySelector('.question-content').style.animation = 'fadeIn 0.3s ease-in-out';
        }, 10);
    }

    function displayReadingPassage(question) {
        const existingPassage = document.querySelector('.reading-passage');
        if (existingPassage) {
            existingPassage.remove();
        }
        
        if (question.passageId && passages[question.passageId]) {
            const passage = passages[question.passageId];
            const passageQuestions = quizData.questions.filter(q => q.passageId === question.passageId);
            const currentPassageIndex = passageQuestions.findIndex(q => q === question) + 1;
            
            const passageHTML = `
                <div class="reading-passage">
                    <div class="passage-info">
                        <span>Reading Comprehension</span>
                        <span class="passage-progress">Question ${currentPassageIndex} of ${passage.questionCount}</span>
                    </div>
                    <div class="passage-text">${passage.text}</div>
                </div>
            `;
            
            const questionContainer = document.getElementById('questionContainer');
            questionContainer.insertAdjacentHTML('afterbegin', passageHTML);
        }
    }

    function displayOptions(options, questionIndex) {
        optionsContainer.innerHTML = '';
        
        options.forEach((option, optionIndex) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option-item';
            
            if (studentAnswers[questionIndex] === optionIndex) {
                optionElement.classList.add('selected');
            }
            
            optionElement.innerHTML = `
                <div class="option-radio"></div>
                <span class="option-letter">${String.fromCharCode(65 + optionIndex)}.</span>
                <span class="option-text">${option}</span>
            `;
            
            optionElement.addEventListener('click', () => selectOption(questionIndex, optionIndex));
            optionsContainer.appendChild(optionElement);
        });
    }

    function selectOption(questionIndex, optionIndex) {
        studentAnswers[questionIndex] = optionIndex;
        
        const optionItems = optionsContainer.querySelectorAll('.option-item');
        optionItems.forEach((item, index) => {
            if (index === optionIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        
        updateQuestionIndicators();
    }

    function updateQuestionIndicators() {
        const indicators = questionIndicators.querySelectorAll('.question-indicator');
        
        indicators.forEach((indicator, index) => {
            indicator.classList.remove('current', 'answered');
            
            if (index === currentQuestionIndex) {
                indicator.classList.add('current');
            }
            
            if (studentAnswers[index] !== null) {
                indicator.classList.add('answered');
            }
        });
    }

    function updateNavigation() {
        prevBtn.disabled = currentQuestionIndex === 0;
        
        if (currentQuestionIndex === quizData.questions.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'flex';
        } else {
            nextBtn.style.display = 'flex';
            submitBtn.style.display = 'none';
        }
    }

    function previousQuestion() {
        if (currentQuestionIndex > 0) {
            displayQuestion(currentQuestionIndex - 1);
        }
    }

    function nextQuestion() {
        if (currentQuestionIndex < quizData.questions.length - 1) {
            displayQuestion(currentQuestionIndex + 1);
        }
    }

    function goToQuestion(index) {
        if (index >= 0 && index < quizData.questions.length) {
            displayQuestion(index);
        }
    }

    function startTimer(timeInSeconds) {
        let remainingTime = timeInSeconds;
        
        function updateTimer() {
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            timeRemaining.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (remainingTime <= 60) {
                timeRemaining.classList.add('timer-danger');
            } else if (remainingTime <= 300) {
                timeRemaining.classList.add('timer-warning');
            }
        }
        
        updateTimer();
        
        timerInterval = setInterval(() => {
            remainingTime--;
            updateTimer();
            
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                alert('Time is up! Submitting your quiz automatically.');
                submitQuiz();
            }
        }, 1000);
    }

    async function submitQuiz() {
        const unansweredQuestions = [];
        studentAnswers.forEach((answer, index) => {
            if (answer === null) {
                unansweredQuestions.push(index + 1);
            }
        });

        if (unansweredQuestions.length > 0) {
            const confirmSubmit = confirm(
                `You have ${unansweredQuestions.length} unanswered question(s): ${unansweredQuestions.join(', ')}.\n\nDo you want to submit anyway?`
            );
            
            if (!confirmSubmit) {
                const firstUnanswered = unansweredQuestions[0] - 1;
                displayQuestion(firstUnanswered);
                return;
            }
        }

        if (timerInterval) {
            clearInterval(timerInterval);
        }

        const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

        submitBtn.innerHTML = '<span class="loading"></span> Submitting...';
        submitBtn.disabled = true;

        try {
            const finalAnswers = studentAnswers.map(answer => answer !== null ? answer : -1);
            
            const response = await fetch(`/api/submit/${shareId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentName,
                    answers: finalAnswers,
                    timeSpent
                })
            });

            const result = await response.json();

            if (response.ok) {
                showResults(result);
            } else {
                alert(result.error || 'Failed to submit quiz');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        } finally {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Submit Quiz';
            submitBtn.disabled = false;
        }
    }

    function showResults(result) {
        quizContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        
        document.getElementById('finalScore').textContent = result.score;
        document.getElementById('finalTotal').textContent = result.totalQuestions;
        document.getElementById('finalPercentage').textContent = result.percentage + '%';
        
        if (result.percentage >= 80) {
            document.querySelector('#resultsContainer .dashboard-title').innerHTML = `
                <i class="fas fa-trophy" style="color: gold;"></i>
                Excellent Work!
            `;
        } else if (result.percentage >= 60) {
            document.querySelector('#resultsContainer .dashboard-title').innerHTML = `
                <i class="fas fa-medal" style="color: silver;"></i>
                Good Job!
            `;
        } else {
            document.querySelector('#resultsContainer .dashboard-title').innerHTML = `
                <i class="fas fa-book-open"></i>
                Keep Learning!
            `;
        }

        const correctionLink = `
            <div class="hero-actions mt-4">
                <a href="/correction/${result.correctionId}" class="btn btn-secondary btn-large">
                    <i class="fas fa-eye"></i>
                    View Corrections
                </a>
                <a href="/" class="btn btn-primary btn-large">
                    <i class="fas fa-home"></i>
                    Back to Home
                </a>
            </div>
        `;
        
        resultsContainer.insertAdjacentHTML('beforeend', correctionLink);
    }

    document.addEventListener('keydown', function(e) {
        if (quizContainer.classList.contains('hidden')) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                if (!prevBtn.disabled) {
                    previousQuestion();
                }
                break;
            case 'ArrowRight':
                if (currentQuestionIndex < quizData.questions.length - 1) {
                    nextQuestion();
                }
                break;
            case 'Enter':
                if (currentQuestionIndex === quizData.questions.length - 1) {
                    submitQuiz();
                } else {
                    nextQuestion();
                }
                break;
            case '1':
            case '2':
            case '3':
            case '4':
                const optionIndex = parseInt(e.key) - 1;
                const currentQuestion = quizData.questions[currentQuestionIndex];
                if (optionIndex < currentQuestion.options.length) {
                    selectOption(currentQuestionIndex, optionIndex);
                }
                break;
        }
    });

    window.addEventListener('beforeunload', function(e) {
        if (!quizContainer.classList.contains('hidden') && !resultsContainer.classList.contains('hidden')) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
});