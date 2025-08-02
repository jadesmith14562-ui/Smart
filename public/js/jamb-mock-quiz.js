document.addEventListener('DOMContentLoaded', function() {
    const shareId = window.location.pathname.split('/').pop();
    let examData = null;
    let studentName = '';
    let studentEmail = '';
    let startTime = null;
    let timerInterval = null;
    let currentSubjectIndex = 0;
    let currentQuestionIndex = 0;
    let studentAnswers = [];
    let allQuestions = [];
    let subjectQuestions = {};

    // DOM Elements
    const studentInfoForm = document.getElementById('studentInfoForm');
    const loadingContainer = document.getElementById('loadingContainer');
    const examContainer = document.getElementById('examContainer');
    const resultsContainer = document.getElementById('resultsContainer');
    const errorContainer = document.getElementById('errorContainer');
    
    // Exam elements
    const examTitle = document.getElementById('examTitle');
    const examDescription = document.getElementById('examDescription');
    const currentSubject = document.getElementById('currentSubject');
    const currentQuestionNum = document.getElementById('currentQuestionNum');
    const totalQuestions = document.getElementById('totalQuestions');
    const questionNumber = document.getElementById('questionNumber');
    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const questionIndicators = document.getElementById('questionIndicators');
    const subjectTabs = document.getElementById('subjectTabs');
    
    // Navigation elements
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    // Timer elements
    const timerDisplay = document.getElementById('timerDisplay');
    const timeRemaining = document.getElementById('timeRemaining');

    // Event Listeners
    document.getElementById('studentForm').addEventListener('submit', startExam);
    prevBtn.addEventListener('click', previousQuestion);
    nextBtn.addEventListener('click', nextQuestion);
    submitBtn.addEventListener('click', submitExam);

    async function startExam(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        studentName = formData.get('studentName');
        studentEmail = formData.get('studentEmail');
        
        if (!studentName.trim() || !studentEmail.trim()) {
            alert('Please enter both your name and email');
            return;
        }

        // Hide form and show loading
        studentInfoForm.classList.add('hidden');
        loadingContainer.classList.remove('hidden');

        try {
            const response = await fetch(`/api/jamb-mock/${shareId}`);
            
            if (!response.ok) {
                throw new Error('JAMB Mock not found');
            }

            examData = await response.json();
            startTime = Date.now();
            
            // Process exam data
            processExamData();
            
            // Hide loading and show exam
            loadingContainer.classList.add('hidden');
            initializeExam();
            
            // Start timer
            if (examData.timeLimit > 0) {
                startTimer(examData.timeLimit * 60); // Convert minutes to seconds
            }
            
        } catch (error) {
            loadingContainer.classList.add('hidden');
            errorContainer.classList.remove('hidden');
            document.getElementById('errorMessage').textContent = error.message;
        }
    }

    function processExamData() {
        // Flatten all questions from all subjects
        allQuestions = [];
        subjectQuestions = {};
        
        examData.subjects.forEach(subject => {
            subjectQuestions[subject.subject] = subject.questions;
            subject.questions.forEach((question, index) => {
                allQuestions.push({
                    ...question,
                    subject: subject.subject,
                    subjectIndex: examData.subjects.findIndex(s => s.subject === subject.subject),
                    originalIndex: index
                });
            });
        });
        
        // Initialize student answers array
        studentAnswers = new Array(allQuestions.length).fill(null);
        
        // Load exam info
        document.getElementById('examInfo').innerHTML = `
            <h3><i class="fas fa-clipboard-list"></i> ${examData.title}</h3>
            <div class="exam-info-grid">
                <div class="info-item">
                    <i class="fas fa-clock"></i>
                    <span>Time Limit: ${examData.timeLimit} minutes</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-question"></i>
                    <span>Total Questions: ${allQuestions.length}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-book"></i>
                    <span>Subjects: ${examData.subjects.length}</span>
                </div>
            </div>
        `;
    }

    function initializeExam() {
        examContainer.classList.remove('hidden');
        
        // Set exam information
        examTitle.textContent = examData.title;
        examDescription.textContent = examData.description || 'JAMB Mock Examination';
        totalQuestions.textContent = allQuestions.length;
        
        // Create subject tabs
        createSubjectTabs();
        
        // Create question indicators
        createQuestionIndicators();
        
        // Display first question
        displayQuestion(0);
        
        // Update navigation
        updateNavigation();
    }

    function createSubjectTabs() {
        subjectTabs.innerHTML = '';
        
        examData.subjects.forEach((subject, index) => {
            const tab = document.createElement('div');
            tab.className = `subject-tab ${subject.subject.toLowerCase()}`;
            tab.textContent = `${subject.subject} (${subject.questions.length})`;
            tab.addEventListener('click', () => goToSubject(index));
            subjectTabs.appendChild(tab);
        });
        
        // Set first tab as active
        if (subjectTabs.children.length > 0) {
            subjectTabs.children[0].classList.add('active');
        }
    }

    function createQuestionIndicators() {
        questionIndicators.innerHTML = '';
        
        for (let i = 0; i < allQuestions.length; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'question-indicator';
            indicator.textContent = i + 1;
            indicator.addEventListener('click', () => goToQuestion(i));
            questionIndicators.appendChild(indicator);
        }
    }

    function displayQuestion(index) {
        if (index < 0 || index >= allQuestions.length) return;
        
        currentQuestionIndex = index;
        const question = allQuestions[index];
        
        // Update current subject
        currentSubject.textContent = question.subject;
        currentQuestionNum.textContent = index + 1;
        questionNumber.textContent = index + 1;
        questionText.innerHTML = question.question;
        
        // Display question images if available
        if (question.imageUrls && question.imageUrls.length > 0) {
            const imagesHTML = question.imageUrls.map((url, idx) => 
                `<img src="${url}" class="question-image" alt="Question image ${idx + 1}">`
            ).join('');
            questionText.innerHTML += `<br>${imagesHTML}`;
        }
        
        // Update progress
        const progress = ((index + 1) / allQuestions.length) * 100;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `Question ${index + 1} of ${allQuestions.length}`;
        
        // Update subject tabs
        updateSubjectTabs(question.subject);
        
        // Display options
        displayOptions(question.options, index);
        
        // Update indicators
        updateQuestionIndicators();
        
        // Update navigation
        updateNavigation();
        
        // Add animation
        document.querySelector('.question-content').style.animation = 'none';
        setTimeout(() => {
            document.querySelector('.question-content').style.animation = 'fadeIn 0.3s ease-in-out';
        }, 10);
    }

    function updateSubjectTabs(activeSubject) {
        const tabs = subjectTabs.querySelectorAll('.subject-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.textContent.includes(activeSubject)) {
                tab.classList.add('active');
            }
        });
    }

    function displayOptions(options, questionIndex) {
        optionsContainer.innerHTML = '';
        
        options.forEach((option, optionIndex) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option-item';
            
            // Check if this option was previously selected
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
        // Update student answers
        studentAnswers[questionIndex] = optionIndex;
        
        // Update UI
        const optionItems = optionsContainer.querySelectorAll('.option-item');
        optionItems.forEach((item, index) => {
            if (index === optionIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        
        // Update question indicators
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
        // Update Previous button
        prevBtn.disabled = currentQuestionIndex === 0;
        
        // Update Next/Submit button
        if (currentQuestionIndex === allQuestions.length - 1) {
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
        if (currentQuestionIndex < allQuestions.length - 1) {
            displayQuestion(currentQuestionIndex + 1);
        }
    }

    function goToQuestion(index) {
        if (index >= 0 && index < allQuestions.length) {
            displayQuestion(index);
        }
    }

    function goToSubject(subjectIndex) {
        // Find first question of the selected subject
        const firstQuestionIndex = allQuestions.findIndex(q => q.subjectIndex === subjectIndex);
        if (firstQuestionIndex !== -1) {
            displayQuestion(firstQuestionIndex);
        }
    }

    function startTimer(timeInSeconds) {
        let remainingTime = timeInSeconds;
        
        function updateTimer() {
            const hours = Math.floor(remainingTime / 3600);
            const minutes = Math.floor((remainingTime % 3600) / 60);
            const seconds = remainingTime % 60;
            timeRemaining.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Change color when time is running low
            if (remainingTime <= 300) { // Last 5 minutes
                timeRemaining.classList.add('timer-danger');
            } else if (remainingTime <= 1800) { // Last 30 minutes
                timeRemaining.classList.add('timer-warning');
            }
        }
        
        updateTimer();
        
        timerInterval = setInterval(() => {
            remainingTime--;
            updateTimer();
            
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                alert('Time is up! Submitting your exam automatically.');
                submitExam();
            }
        }, 1000);
    }

    async function submitExam() {
        // Check if all questions are answered
        const unansweredQuestions = [];
        studentAnswers.forEach((answer, index) => {
            if (answer === null) {
                unansweredQuestions.push(index + 1);
            }
        });

        if (unansweredQuestions.length > 0) {
            const confirmSubmit = confirm(
                `You have ${unansweredQuestions.length} unanswered question(s).\n\nDo you want to submit anyway?`
            );
            
            if (!confirmSubmit) {
                // Go to first unanswered question
                const firstUnanswered = unansweredQuestions[0] - 1;
                displayQuestion(firstUnanswered);
                return;
            }
        }

        // Clear timer if running
        if (timerInterval) {
            clearInterval(timerInterval);
        }

        // Calculate time spent
        const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

        // Show loading state
        submitBtn.innerHTML = '<span class="loading"></span> Submitting...';
        submitBtn.disabled = true;

        try {
            // Format answers for submission
            const formattedAnswers = studentAnswers.map((answer, index) => {
                const question = allQuestions[index];
                return {
                    subject: question.subject,
                    questionIndex: question.originalIndex,
                    selectedAnswer: answer !== null ? answer : -1
                };
            });
            
            const response = await fetch(`/api/jamb-mock/submit/${shareId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentName,
                    studentEmail,
                    answers: formattedAnswers,
                    timeSpent
                })
            });

            const result = await response.json();

            if (response.ok) {
                showResults(result);
            } else {
                alert(result.error || 'Failed to submit exam');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        } finally {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Submit Exam';
            submitBtn.disabled = false;
        }
    }

    function showResults(result) {
        // Hide exam and show results
        examContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        
        // Update overall results
        document.getElementById('totalScore').textContent = result.totalScore;
        document.getElementById('totalPossible').textContent = result.totalQuestions;
        document.getElementById('overallPercentage').textContent = result.percentage + '%';
        
        // Display subject scores
        const subjectScoresContainer = document.getElementById('subjectScores');
        subjectScoresContainer.innerHTML = result.scores.map(score => `
            <div class="subject-score-card">
                <h4>${score.subject}</h4>
                <div class="subject-score">${score.score}/${score.totalQuestions}</div>
                <div class="subject-percentage">${Math.round((score.score / score.totalQuestions) * 100)}%</div>
            </div>
        `).join('');
        
        // Add celebration effect for good scores
        if (result.percentage >= 70) {
            document.querySelector('.results-title').innerHTML = `
                <i class="fas fa-trophy" style="color: gold;"></i>
                Excellent Performance!
            `;
        } else if (result.percentage >= 50) {
            document.querySelector('.results-title').innerHTML = `
                <i class="fas fa-medal" style="color: silver;"></i>
                Good Effort!
            `;
        } else {
            document.querySelector('.results-title').innerHTML = `
                <i class="fas fa-book-open"></i>
                Keep Studying!
            `;
        }
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (examContainer.classList.contains('hidden')) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                if (!prevBtn.disabled) {
                    previousQuestion();
                }
                break;
            case 'ArrowRight':
                if (currentQuestionIndex < allQuestions.length - 1) {
                    nextQuestion();
                }
                break;
            case 'Enter':
                if (currentQuestionIndex === allQuestions.length - 1) {
                    submitExam();
                } else {
                    nextQuestion();
                }
                break;
            case '1':
            case '2':
            case '3':
            case '4':
                const optionIndex = parseInt(e.key) - 1;
                const currentQuestion = allQuestions[currentQuestionIndex];
                if (optionIndex < currentQuestion.options.length) {
                    selectOption(currentQuestionIndex, optionIndex);
                }
                break;
        }
    });

    // Prevent accidental page refresh
    window.addEventListener('beforeunload', function(e) {
        if (!examContainer.classList.contains('hidden') && !resultsContainer.classList.contains('hidden')) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
});