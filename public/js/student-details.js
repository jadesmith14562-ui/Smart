document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    
    const responseId = window.location.pathname.split('/').pop();
    
    loadStudentDetails();
    
    document.getElementById('logoutBtn').addEventListener('click', logout);

    async function checkAuthentication() {
        try {
            const response = await fetch('/api/verify');
            if (!response.ok) {
                window.location.href = '/teacher-login';
            }
        } catch (error) {
            window.location.href = '/teacher-login';
        }
    }

    async function loadStudentDetails() {
        try {
            const response = await fetch(`/api/student-details/${responseId}`);
            
            if (!response.ok) {
                throw new Error('Student details not found');
            }

            const data = await response.json();
            
            document.getElementById('loadingContainer').classList.add('hidden');
            displayStudentDetails(data);
            
        } catch (error) {
            document.getElementById('loadingContainer').classList.add('hidden');
            document.getElementById('errorContainer').classList.remove('hidden');
        }
    }

    function displayStudentDetails(data) {
        document.getElementById('detailsContainer').classList.remove('hidden');
        
        document.getElementById('studentHeader').innerHTML = `
            <strong>${data.studentName}</strong> - ${data.quiz.title} (${data.quiz.subject})<br>
            <small>Submitted on ${new Date(data.submittedAt).toLocaleString()}</small>
        `;
        
        document.getElementById('studentScore').textContent = `${data.score}/${data.totalQuestions}`;
        document.getElementById('studentPercentage').textContent = `${data.percentage}%`;
        document.getElementById('timeSpent').textContent = formatTime(data.timeSpent || 0);
        
        displayQuestionAnalysis(data.questionAnalysis);
    }

    function displayQuestionAnalysis(questionAnalysis) {
        const container = document.getElementById('questionAnalysis');
        container.innerHTML = '';
        
        questionAnalysis.forEach((analysis, index) => {
            const isCorrect = analysis.isCorrect;
            
            const questionHTML = `
                <div class="question-item correction-item ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="question-header">
                        <h3 class="text-primary mb-3">
                            <i class="fas fa-${isCorrect ? 'check-circle text-success' : 'times-circle text-error'}"></i>
                            Question ${index + 1}
                            <span class="question-status ${isCorrect ? 'correct' : 'incorrect'}">
                                ${isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                        </h3>
                    </div>
                    
                    <p class="mb-3"><strong>${analysis.question}</strong></p>
                    ${analysis.imageUrl ? `<img src="${analysis.imageUrl}" class="question-image" alt="Question image">` : ''}
                    
                    <div class="options-review">
                        ${analysis.options.map((option, optionIndex) => {
                            let optionClass = '';
                            let optionIcon = '';
                            
                            if (optionIndex === analysis.correctAnswer) {
                                optionClass = 'correct-option';
                                optionIcon = '<i class="fas fa-check"></i>';
                            } else if (optionIndex === analysis.studentAnswer && analysis.studentAnswer !== analysis.correctAnswer) {
                                optionClass = 'incorrect-option';
                                optionIcon = '<i class="fas fa-times"></i>';
                            }
                            
                            return `
                                <div class="option-review ${optionClass}">
                                    <span class="option-letter">${String.fromCharCode(65 + optionIndex)}.</span>
                                    <span class="option-text">${option}</span>
                                    <span class="option-indicator">${optionIcon}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="answer-explanation">
                        <div class="your-answer">
                            <strong>Student's Answer:</strong> 
                            <span class="${isCorrect ? 'text-success' : 'text-error'}">
                                ${String.fromCharCode(65 + analysis.studentAnswer)} - ${analysis.options[analysis.studentAnswer]}
                            </span>
                        </div>
                        <div class="correct-answer">
                            <strong>Correct Answer:</strong> 
                            <span class="text-success">
                                ${String.fromCharCode(65 + analysis.correctAnswer)} - ${analysis.options[analysis.correctAnswer]}
                            </span>
                        </div>
                        ${!isCorrect ? `
                            <div class="mt-2">
                                <small class="text-error">
                                    <i class="fas fa-info-circle"></i>
                                    This question was answered incorrectly. The student may need additional review on this topic.
                                </small>
                            </div>
                        ` : `
                            <div class="mt-2">
                                <small class="text-success">
                                    <i class="fas fa-check-circle"></i>
                                    Excellent! This question was answered correctly.
                                </small>
                            </div>
                        `}
                    </div>
                </div>
            `;
            
            container.insertAdjacentHTML('beforeend', questionHTML);
        });
    }

    function formatTime(seconds) {
        if (seconds === 0) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    async function logout() {
        try {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/';
        }
    }
});