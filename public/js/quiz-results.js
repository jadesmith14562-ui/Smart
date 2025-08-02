
  document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    
    const quizId = window.location.pathname.split('/').pop();
    
    loadQuizResults();
    
    document.getElementById('logoutBtn').addEventListener('click', logout);

    async function checkAuthentication()
      {
        try {
            const response = await fetch('/api/verify');
            if (!response.ok) {
                window.location.href = '/teacher-login';
            }
        } catch (error) {
            window.location.href = '/teacher-login';
        }
    }

    async function loadQuizResults() {
        try {
            // Load quiz responses
            const responsesResponse = await fetch(`/api/responses/${quizId}`);
            if (!responsesResponse.ok) {
                throw new Error('Failed to load quiz results');
            }
            
            const data = await responsesResponse.json();
            
            // Load quiz statistics
            const statsResponse = await fetch(`/api/quiz-stats/${quizId}`);
            const stats = await statsResponse.json();
            
            document.getElementById('loadingContainer').classList.add('hidden');
            displayResults(data, stats);
            
        } catch (error) {
            document.getElementById('loadingContainer').classList.add('hidden');
            document.getElementById('errorContainer').classList.remove('hidden');
        }
    }

    function displayResults(data, stats) {
        document.getElementById('resultsContainer').classList.remove('hidden');
        
        // Update quiz information
        document.getElementById('quizInfo').innerHTML = `
            <strong>${data.quiz.title}</strong> - ${data.quiz.subject}<br>
            <small>Total Questions: ${data.quiz.totalQuestions}${data.quiz.timeLimit > 0 ? ` | Time Limit: ${data.quiz.timeLimit} minutes` : ''}</small>
        `;
        
        // Update statistics
        document.getElementById('totalAttempts').textContent = stats.totalAttempts;
        document.getElementById('averageScore').textContent = `${stats.averageScore}%`;
        document.getElementById('highestScore').textContent = `${stats.highestScore}%`;
        
        // Add average time if available
        if (stats.averageTime > 0) {
            const avgTimeCard = `
                <div class="stat-card">
                    <div class="stat-number">${formatTime(stats.averageTime)}</div>
                    <div class="stat-label">Average Time</div>
                </div>
            `;
            document.getElementById('quizStats').insertAdjacentHTML('beforeend', avgTimeCard);
        }
        
        // Display responses table
        displayResponsesTable(data.responses);
    }

    function displayResponsesTable(responses) {
        const container = document.getElementById('responsesTable');
        
        if (responses.length === 0) {
            container.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-clipboard-list fa-3x text-secondary mb-3"></i>
                    <p class="text-secondary">No student responses yet for this quiz.</p>
                </div>
            `;
            return;
        }

        const tableHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th><i class="fas fa-user"></i> Student Name</th>
                            <th><i class="fas fa-trophy"></i> Score</th>
                            <th><i class="fas fa-percentage"></i> Percentage</th>
                            <th><i class="fas fa-clock"></i> Time Spent</th>
                            <th><i class="fas fa-calendar"></i> Submitted</th>
                            <th><i class="fas fa-chart-line"></i> Performance</th>
                            <th><i class="fas fa-eye"></i> Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${responses.map(response => {
                            const percentage = Math.round((response.score / response.totalQuestions) * 100);
                            return `
                                <tr>
                                    <td><strong>${response.studentName}</strong></td>
                                    <td>${response.score}/${response.totalQuestions}</td>
                                    <td>
                                        <span class="text-${getScoreColor(percentage)}">
                                            ${percentage}%
                                        </span>
                                    </td>
                                    <td>${formatTime(response.timeSpent || 0)}</td>
                                    <td>${new Date(response.submittedAt).toLocaleString()}</td>
                                    <td>
                                        <div class="performance-bar">
                                            <div class="performance-fill ${getScoreColor(percentage)}" 
                                                 style="width: ${percentage}%"></div>
                                        </div>
                                    </td>
                                    <td>
                                        <button class="btn btn-outline" onclick="viewStudentDetails('${response._id}')">
                                            <i class="fas fa-search"></i>
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        container.innerHTML = tableHTML;
    }

    function formatTime(seconds) {
        if (seconds === 0) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function getScoreColor(percentage) {
        if (percentage >= 80) return 'success';
        if (percentage >= 60) return 'warning';
        return 'error';
    }

    window.viewStudentDetails = function(responseId) {
        window.location.href = `/student-details/${responseId}`;
    };

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
