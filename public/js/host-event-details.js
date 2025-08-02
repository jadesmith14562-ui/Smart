document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    
    const eventId = window.location.pathname.split('/').pop();
    
    loadEventDetails();
    
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

    async function loadEventDetails() {
        try {
            const response = await fetch(`/api/host/events/${eventId}/details`);
            
            if (!response.ok) {
                throw new Error('Event not found');
            }

            const event = await response.json();
            
            document.getElementById('loadingContainer').classList.add('hidden');
            displayEventDetails(event);
            
        } catch (error) {
            document.getElementById('loadingContainer').classList.add('hidden');
            document.getElementById('errorContainer').classList.remove('hidden');
        }
    }

    function displayEventDetails(event) {
        document.getElementById('detailsContainer').classList.remove('hidden');
        
        // Update event information
        document.getElementById('eventInfo').innerHTML = `
            <strong>${event.title}</strong><br>
            <small>
                Status: ${event.status} | 
                Time Limit: ${event.timeLimit} minutes | 
                Total Questions: ${event.totalQuestions} |
                Deadline: ${new Date(event.deadline).toLocaleString()}
            </small>
            ${event.description ? `<br><em>${event.description}</em>` : ''}
        `;
        
        displaySubjects(event.subjects);
        displayContributions(event.subjects);
    }

    function displaySubjects(subjects) {
        const container = document.getElementById('subjectsContainer');
        
        const subjectsHTML = subjects.map(subject => `
            <div class="subject-detail-card">
                <div class="subject-header">
                    <h3 class="subject-name">
                        <i class="fas fa-${getSubjectIcon(subject.subject)}"></i>
                        ${subject.subject}
                    </h3>
                    <span class="question-count">${subject.questionCount} questions</span>
                </div>
                
                <div class="questions-list">
                    ${subject.questions.length > 0 ? 
                        subject.questions.map((question, index) => `
                            <div class="question-preview">
                                <div class="question-header">
                                    <span class="question-num">Q${index + 1}</span>
                                    <span class="teacher-name">by ${question.teacherName}</span>
                                </div>
                                <div class="question-text">${question.question}</div>
                                ${question.imageUrls && question.imageUrls.length > 0 ? 
                                    `<div class="question-images">
                                        ${question.imageUrls.map(url => `<img src="${url}" class="question-image-thumb" alt="Question image">`).join('')}
                                    </div>` : ''
                                }
                                <div class="question-options">
                                    ${question.options.map((option, optIndex) => `
                                        <div class="option-preview ${optIndex === question.correctAnswer ? 'correct' : ''}">
                                            <span class="option-letter">${String.fromCharCode(65 + optIndex)}.</span>
                                            <span class="option-text">${option}</span>
                                            ${optIndex === question.correctAnswer ? '<i class="fas fa-check"></i>' : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('') : 
                        '<p class="no-questions">No questions added yet for this subject.</p>'
                    }
                </div>
            </div>
        `).join('');
        
        container.innerHTML = subjectsHTML;
    }

    function displayContributions(subjects) {
        const container = document.getElementById('contributionsContainer');
        
        // Collect all teacher contributions
        const allContributions = [];
        subjects.forEach(subject => {
            if (subject.teacherContributions) {
                subject.teacherContributions.forEach(contribution => {
                    allContributions.push({
                        ...contribution,
                        subject: subject.subject
                    });
                });
            }
        });
        
        if (allContributions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-plus"></i>
                    <h3>No Teacher Contributions</h3>
                    <p>No teachers have contributed questions to this event yet.</p>
                </div>
            `;
            return;
        }

        const contributionsHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th><i class="fas fa-user"></i> Teacher</th>
                            <th><i class="fas fa-book"></i> Subject</th>
                            <th><i class="fas fa-question"></i> Questions</th>
                            <th><i class="fas fa-eye"></i> Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allContributions.map(contribution => `
                            <tr>
                                <td><strong>${contribution.teacherName}</strong></td>
                                <td><span class="subject-badge ${contribution.subject.toLowerCase()}">${contribution.subject}</span></td>
                                <td>${contribution.questionCount}</td>
                                <td>
                                    <button class="btn btn-outline btn-small" onclick="viewTeacherQuestions('${contribution.teacherId}', '${contribution.subject}')">
                                        <i class="fas fa-eye"></i>
                                        View Questions
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        container.innerHTML = contributionsHTML;
    }

    function getSubjectIcon(subject) {
        const icons = {
            'Mathematics': 'calculator',
            'English': 'language',
            'Physics': 'atom',
            'Chemistry': 'flask',
            'Biology': 'dna'
        };
        return icons[subject] || 'book';
    }

    window.viewTeacherQuestions = function(teacherId, subject) {
        // Scroll to the subject section and highlight teacher's questions
        const subjectCards = document.querySelectorAll('.subject-detail-card');
        subjectCards.forEach(card => {
            const subjectName = card.querySelector('.subject-name').textContent.trim();
            if (subjectName === subject) {
                card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                card.style.border = '2px solid var(--primary-color)';
                setTimeout(() => {
                    card.style.border = '';
                }, 3000);
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