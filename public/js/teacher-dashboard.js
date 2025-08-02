document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadDashboardData();

    document.getElementById('logoutBtn').addEventListener('click', logout);

    async function checkAuthentication() {
        try {
            const response = await fetch('/api/verify');
            if (!response.ok) {
                window.location.href = '/teacher-login';
                return;
            }
            
            const data = await response.json();
            document.getElementById('teacherName').textContent = `Welcome, ${data.teacher.name}`;
        } catch (error) {
            window.location.href = '/teacher-login';
        }
    }

    async function loadDashboardData() {
        try {
            // Load quizzes
            const quizzesResponse = await fetch('/api/quizzes');
            const quizzes = await quizzesResponse.json();
            
            // Load responses (grouped by quiz)
            const responsesResponse = await fetch('/api/all-responses');
            const groupedResponses = await responsesResponse.json();

            // Calculate total responses
            let totalResponses = 0;
            let totalScore = 0;
            let responseCount = 0;

            Object.values(groupedResponses).forEach(group => {
                totalResponses += group.responses.length;
                group.responses.forEach(response => {
                    totalScore += (response.score / response.totalQuestions * 100);
                    responseCount++;
                });
            });

            // Update statistics
            document.getElementById('totalQuizzes').textContent = quizzes.length;
            document.getElementById('totalResponses').textContent = totalResponses;
            
            if (responseCount > 0) {
                const averageScore = Math.round(totalScore / responseCount);
                document.getElementById('averageScore').textContent = averageScore + '%';
            }

            displayQuizzes(quizzes, groupedResponses);
            displayGroupedResponses(groupedResponses);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    function displayQuizzes(quizzes, groupedResponses) {
        const container = document.getElementById('quizzesContainer');
        
        if (quizzes.length === 0) {
            container.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-clipboard-list fa-3x text-secondary mb-3"></i>
                    <p class="text-secondary">No quizzes created yet. <a href="/create-quiz" class="text-primary">Create your first quiz</a>!</p>
                </div>
            `;
            return;
        }

        const tableHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th><i class="fas fa-heading"></i> Title</th>
                            <th><i class="fas fa-calendar"></i> Created</th>
                            <th><i class="fas fa-question"></i> Questions</th>
                            <th><i class="fas fa-clock"></i> Time Limit</th>
                            <th><i class="fas fa-users"></i> Responses</th>
                            <th><i class="fas fa-share"></i> Share Link</th>
                            <th><i class="fas fa-cogs"></i> Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${quizzes.map(quiz => {
                            const responseCount = groupedResponses[quiz._id] ? groupedResponses[quiz._id].responses.length : 0;
                            return `
                                <tr>
                                    <td><strong>${quiz.title}</strong></td>
                                    <td>${new Date(quiz.createdAt).toLocaleDateString()}</td>
                                    <td>${quiz.questions.length}</td>
                                    <td>${quiz.timeLimit > 0 ? `${quiz.timeLimit} min` : 'No limit'}</td>
                                    <td><span class="text-primary">${responseCount}</span></td>
                                    <td>
                                        <button class="btn btn-outline" onclick="copyShareLink('${quiz.shareId}')">
                                            <i class="fas fa-copy"></i> Copy Link
                                        </button>
                                    </td>
                                    <td>
                                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                            <button class="btn btn-secondary" onclick="viewResponses('${quiz._id}')">
                                                <i class="fas fa-chart-bar"></i> Results
                                            </button>
                                            <button class="btn btn-error" onclick="deleteQuiz('${quiz._id}', '${quiz.title}')">
                                                <i class="fas fa-trash"></i> Delete
                                            </button>
                                        </div>
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

    function displayGroupedResponses(groupedResponses) {
        const container = document.getElementById('responsesContainer');
        
        if (Object.keys(groupedResponses).length === 0) {
            container.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-chart-bar fa-3x text-secondary mb-3"></i>
                    <p class="text-secondary">No student responses yet. Share your quiz links with students!</p>
                </div>
            `;
            return;
        }

        let responsesHTML = '';
        
        Object.values(groupedResponses).forEach(group => {
            const recentResponses = group.responses.slice(0, 5); // Show only recent 5 responses per quiz
            
            responsesHTML += `
                <div class="quiz-responses-section">
                    <h3 class="text-primary mb-3">
                        <i class="fas fa-file-alt"></i>
                        ${group.quiz.title} (${group.quiz.subject})
                        <span class="text-secondary" style="font-size: 0.8em;">
                            - ${group.responses.length} total responses
                            ${group.quiz.timeLimit > 0 ? ` | ${group.quiz.timeLimit} min limit` : ''}
                        </span>
                    </h3>
                    
                    <div class="table-container mb-4">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th><i class="fas fa-user"></i> Student Name</th>
                                    <th><i class="fas fa-trophy"></i> Score</th>
                                    <th><i class="fas fa-percentage"></i> Percentage</th>
                                    <th><i class="fas fa-clock"></i> Time Spent</th>
                                    <th><i class="fas fa-calendar"></i> Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${recentResponses.map(response => `
                                    <tr>
                                        <td><strong>${response.studentName}</strong></td>
                                        <td>${response.score}/${response.totalQuestions}</td>
                                        <td>
                                            <span class="text-${getScoreColor(response.score / response.totalQuestions * 100)}">
                                                ${Math.round(response.score / response.totalQuestions * 100)}%
                                            </span>
                                        </td>
                                        <td>${formatTime(response.timeSpent || 0)}</td>
                                        <td>${new Date(response.submittedAt).toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    ${group.responses.length > 5 ? `
                        <div class="text-center mb-4">
                            <button class="btn btn-outline" onclick="viewResponses('${group.quiz._id}')">
                                <i class="fas fa-eye"></i>
                                View All ${group.responses.length} Responses
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        container.innerHTML = responsesHTML;
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

    window.copyShareLink = function(shareId) {
        const link = `${window.location.origin}/quiz/${shareId}`;
        navigator.clipboard.writeText(link).then(() => {
            showAlert('Quiz link copied to clipboard!', 'success');
        }).catch(() => {
            prompt('Copy this link:', link);
        });
    };

    window.viewResponses = function(quizId) {
        window.location.href = `/quiz-results/${quizId}`;
    };

    window.deleteQuiz = async function(quizId, quizTitle) {
        // Show confirmation dialog
        const confirmed = confirm(`Are you sure you want to delete the quiz "${quizTitle}"?\n\nThis action will:\n• Delete the quiz permanently\n• Delete all student responses\n• Cannot be undone\n\nClick OK to confirm deletion.`);
        
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/api/quiz/${quizId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                showAlert('Quiz deleted successfully!', 'success');
                // Reload the dashboard data to reflect changes
                setTimeout(() => {
                    loadDashboardData();
                }, 1500);
            } else {
                showAlert(result.error || 'Failed to delete quiz', 'error');
            }
        } catch (error) {
            showAlert('Network error. Please try again.', 'error');
        }
    };

    function showAlert(message, type) {
        // Create alert container if it doesn't exist
        let alertContainer = document.getElementById('alert-container');
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.id = 'alert-container';
            alertContainer.style.position = 'fixed';
            alertContainer.style.top = '20px';
            alertContainer.style.right = '20px';
            alertContainer.style.zIndex = '1000';
            document.body.appendChild(alertContainer);
        }

        alertContainer.innerHTML = `
            <div class="alert alert-${type}" style="min-width: 300px; box-shadow: var(--shadow-lg);">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'exclamation-circle'}"></i>
                ${message}
            </div>
        `;
        
        setTimeout(() => {
            alertContainer.innerHTML = '';
        }, 5000);
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