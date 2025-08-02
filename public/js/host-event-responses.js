document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    
    const eventId = window.location.pathname.split('/').pop();
    
    loadEventResponses();
    
    document.getElementById('logoutBtn').addEventListener('click', logout);

    async function checkAuthentication() {
        try {
            const response = await fetch('/api/host/verify');
            if (!response.ok) {
                window.location.href = '/host-login';
            }
        } catch (error) {
            window.location.href = '/host-login';
        }
    }

    async function loadEventResponses() {
        try {
            const response = await fetch(`/api/host/events/${eventId}/responses`);
            
            if (!response.ok) {
                throw new Error('Event responses not found');
            }

            const data = await response.json();
            
            document.getElementById('loadingContainer').classList.add('hidden');
            displayEventResponses(data);
            
        } catch (error) {
            document.getElementById('loadingContainer').classList.add('hidden');
            document.getElementById('errorContainer').classList.remove('hidden');
        }
    }

    function displayEventResponses(data) {
        document.getElementById('responsesContainer').classList.remove('hidden');
        
        // Update event information
        document.getElementById('eventInfo').innerHTML = `
            <strong>${data.event.title}</strong><br>
            <small>
                Time Limit: ${data.event.timeLimit} minutes | 
                Total Questions: ${data.event.totalQuestions}
            </small>
            ${data.event.description ? `<br><em>${data.event.description}</em>` : ''}
        `;
        
        // Calculate statistics
        const responses = data.responses || [];
        const totalResponses = responses.length;
        
        let totalScore = 0;
        let totalTime = 0;
        let highestScore = 0;
        
        responses.forEach(response => {
            const percentage = Math.round((response.totalScore / response.totalQuestions) * 100);
            totalScore += percentage;
            totalTime += response.timeSpent || 0;
            if (percentage > highestScore) {
                highestScore = percentage;
            }
        });
        
        const averageScore = totalResponses > 0 ? Math.round(totalScore / totalResponses) : 0;
        const averageTime = totalResponses > 0 ? Math.round(totalTime / totalResponses) : 0;
        
        // Update statistics
        document.getElementById('totalResponses').textContent = totalResponses;
        document.getElementById('averageScore').textContent = averageScore + '%';
        document.getElementById('highestScore').textContent = highestScore + '%';
        document.getElementById('averageTime').textContent = formatTime(averageTime);
        
        displayResponsesTable(responses);
    }

    function displayResponsesTable(responses) {
        const container = document.getElementById('responsesTable');
        
        if (responses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No Student Responses</h3>
                    <p>No students have taken this JAMB Mock exam yet.</p>
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
                            <th><i class="fas fa-envelope"></i> Email</th>
                            <th><i class="fas fa-trophy"></i> Total Score</th>
                            <th><i class="fas fa-percentage"></i> Percentage</th>
                            <th><i class="fas fa-clock"></i> Time Spent</th>
                            <th><i class="fas fa-calendar"></i> Submitted</th>
                            <th><i class="fas fa-chart-line"></i> Subject Breakdown</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${responses.map(response => {
                            const percentage = Math.round((response.totalScore / response.totalQuestions) * 100);
                            return `
                                <tr>
                                    <td><strong>${response.studentName}</strong></td>
                                    <td>${response.studentEmail}</td>
                                    <td>${response.totalScore}/${response.totalQuestions}</td>
                                    <td>
                                        <span class="text-${getScoreColor(percentage)}">
                                            ${percentage}%
                                        </span>
                                    </td>
                                    <td>${formatTime(response.timeSpent || 0)}</td>
                                    <td>${new Date(response.submittedAt).toLocaleString()}</td>
                                    <td>
                                        <button class="btn btn-outline btn-small" onclick="viewSubjectBreakdown('${response._id}')">
                                            <i class="fas fa-chart-pie"></i>
                                            View Breakdown
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
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    }

    function getScoreColor(percentage) {
        if (percentage >= 70) return 'success';
        if (percentage >= 50) return 'warning';
        return 'error';
    }

    window.viewSubjectBreakdown = function(responseId) {
        // Find the response and show subject breakdown in a modal or expand inline
        const responses = document.querySelectorAll('tbody tr');
        responses.forEach(row => {
            if (row.dataset.responseId === responseId) {
                // Toggle breakdown display
                const existingBreakdown = row.nextElementSibling;
                if (existingBreakdown && existingBreakdown.classList.contains('breakdown-row')) {
                    existingBreakdown.remove();
                } else {
                    // Add breakdown row
                    // This would require additional API endpoint to get detailed breakdown
                    console.log('View breakdown for response:', responseId);
                }
            }
        });
    };

    async function logout() {
        try {
            await fetch('/api/host/logout', { method: 'POST' });
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/';
        }
    }
});