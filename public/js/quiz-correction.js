document.addEventListener('DOMContentLoaded', function() {
    const correctionId = window.location.pathname.split('/').pop();
    
    loadCorrection();

    async function loadCorrection() {
        try {
            const response = await fetch(`/api/correction/${correctionId}`);
            
            if (!response.ok) {
                throw new Error('Correction not found');
            }

            const data = await response.json();
            
            document.getElementById('loadingContainer').classList.add('hidden');
            displayCorrection(data);
            
        } catch (error) {
            document.getElementById('loadingContainer').classList.add('hidden');
            document.getElementById('errorContainer').classList.remove('hidden');
        }
    }

    function displayCorrection(data) {
        document.getElementById('correctionContainer').classList.remove('hidden');
        
        document.getElementById('correctionHeader').innerHTML = `
            <strong>${data.studentName}</strong> - ${data.quiz.title} (${data.quiz.subject})<br>
            <small>Submitted on ${new Date(data.submittedAt).toLocaleString()}</small>
        `;
        
        document.getElementById('finalScore').textContent = `${data.score}/${data.totalQuestions}`;
        document.getElementById('finalPercentage').textContent = `${data.percentage}%`;
        document.getElementById('correctAnswers').textContent = data.score;
        
        const questionsContainer = document.getElementById('questionsReview');
        questionsContainer.innerHTML = '';
        
        data.quiz.questions.forEach((question, index) => {
            const studentAnswer = data.studentAnswers[index];
            const correctAnswer = question.correctAnswer;
            const isCorrect = studentAnswer === correctAnswer;
            
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
                    
                    <p class="mb-3"><strong>${question.question}</strong></p>
                    ${question.imageUrl ? `<img src="${question.imageUrl}" class="question-image" alt="Question image">` : ''}
                    
                    <div class="options-review">
                        ${question.options.map((option, optionIndex) => {
                            let optionClass = '';
                            let optionIcon = '';
                            
                            if (optionIndex === correctAnswer) {
                                optionClass = 'correct-option';
                                optionIcon = '<i class="fas fa-check"></i>';
                            } else if (optionIndex === studentAnswer && studentAnswer !== correctAnswer) {
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
                            <strong>Your Answer:</strong> 
                            <span class="${isCorrect ? 'text-success' : 'text-error'}">
                                ${String.fromCharCode(65 + studentAnswer)} - ${question.options[studentAnswer]}
                            </span>
                        </div>
                        <div class="correct-answer">
                            <strong>Correct Answer:</strong> 
                            <span class="text-success">
                                ${String.fromCharCode(65 + correctAnswer)} - ${question.options[correctAnswer]}
                            </span>
                        </div>
                    </div>
                </div>
            `;
            
            questionsContainer.insertAdjacentHTML('beforeend', questionHTML);
        });
    }
});