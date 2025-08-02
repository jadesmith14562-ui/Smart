document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadDashboardData();

    // DOM Elements
    const createEventBtn = document.getElementById('createEventBtn');
    const createEventModal = document.getElementById('createEventModal');
    const createEventForm = document.getElementById('createEventForm');
    const cancelEventBtn = document.getElementById('cancelEventBtn');
    const closeBtn = document.querySelector('.close');
    const logoutBtn = document.getElementById('logoutBtn');

    // Event Listeners
    createEventBtn.addEventListener('click', openCreateEventModal);
    cancelEventBtn.addEventListener('click', closeCreateEventModal);
    closeBtn.addEventListener('click', closeCreateEventModal);
    createEventForm.addEventListener('submit', createEvent);
    logoutBtn.addEventListener('click', logout);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === createEventModal) {
            closeCreateEventModal();
        }
    });

    async function checkAuthentication() {
        try {
            console.log('Checking host authentication...');
            const response = await fetch('/api/host/verify');
            console.log('Host verification response:', response.status);
            
            if (!response.ok) {
                console.log('Host verification failed, redirecting to login');
                throw new Error('Authentication failed');
            }
            
            const data = await response.json();
            console.log('Host verification data:', data);
            
            if (data.authenticated && data.host) {
                document.getElementById('hostName').textContent = `Welcome, ${data.host.name}`;
                console.log('Host authentication successful');
            } else {
                throw new Error('Invalid authentication response');
            }
        } catch (error) {
            console.error('Host authentication error:', error);
            // Clear any existing tokens and redirect
            document.cookie = 'hostToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            window.location.href = '/host-login';
        }
    }

    async function loadDashboardData() {
        try {
            console.log('Loading dashboard data...');
            
            // Load events
            const eventsResponse = await fetch('/api/host/events');
            console.log('Events response status:', eventsResponse.status);
            
            if (!eventsResponse.ok) {
                throw new Error('Failed to load events');
            }
            
            const eventsData = await eventsResponse.json();
            console.log('Events data received:', eventsData);
            const events = Array.isArray(eventsData) ? eventsData : [];
            console.log('Processed events array:', events.length);
            
            // Load teachers
            const teachersResponse = await fetch('/api/host/teachers');
            console.log('Teachers response status:', teachersResponse.status);
            
            if (!teachersResponse.ok) {
                throw new Error('Failed to load teachers');
            }
            
            const teachersData = await teachersResponse.json();
            console.log('Teachers data received:', teachersData);
            const teachers = Array.isArray(teachersData) ? teachersData : [];
            console.log('Processed teachers array:', teachers.length);

            // Calculate statistics
            const activeEvents = events.filter(event => event.status === 'active').length;
            const totalQuestions = events.reduce((sum, event) => sum + event.totalQuestions, 0);

            // Update statistics
            document.getElementById('totalEvents').textContent = events.length;
            document.getElementById('activeEvents').textContent = activeEvents;
            document.getElementById('totalQuestions').textContent = totalQuestions;
            document.getElementById('totalTeachers').textContent = teachers.length;

            displayEvents(events);
            displayTeachers(teachers);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            showAlert('Error loading dashboard data', 'error');
        }
    }

    function displayEvents(events) {
        const container = document.getElementById('eventsContainer');
        
        console.log('Displaying events:', events.length);
        
        if (events.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-plus"></i>
                    <h3>No Events Created Yet</h3>
                    <p>Create your first JAMB Mock event to get started with collaborative question creation.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('createEventBtn').click()">
                        <i class="fas fa-plus"></i>
                        Create First Event
                    </button>
                </div>
            `;
            return;
        }

        const eventsHTML = `
            <div class="events-grid">
                ${events.map((event, index) => {
                    console.log(`Processing event ${index}:`, event.title);
                    const progress = calculateEventProgress(event);
                    const statusClass = getEventStatusClass(event);
                    
                    return `
                        <div class="event-card">
                            <div class="event-header">
                                <div>
                                    <h3 class="event-title">${event.title}</h3>
                                    <span class="event-status ${statusClass}">${event.status}</span>
                                </div>
                            </div>
                            
                            <p class="event-description">${event.description || 'No description provided'}</p>
                            
                            <div class="event-meta">
                                <div class="meta-item">
                                    <i class="fas fa-clock"></i>
                                    <span>${event.timeLimit} minutes</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-list-ol"></i>
                                    <span>${event.questionsPerSubject} per subject</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-calendar"></i>
                                    <span>Due: ${new Date(event.deadline).toLocaleDateString()}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-users"></i>
                                    <span>${event.totalQuestions || 0} total questions</span>
                                </div>
                            </div>
                            
                            <div class="event-progress">
                                <div class="progress-label">
                                    <span>Completion Progress</span>
                                    <span>${progress.percentage}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                                </div>
                            </div>
                            
                            <div class="event-subjects">
                                ${['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology'].map(subject => {
                                    const subjectData = (event.subjects || []).find(s => s.subject === subject);
                                    const isCompleted = subjectData && subjectData.questionCount >= event.questionsPerSubject;
                                    
                                    return `
                                        <div class="subject-status ${isCompleted ? 'completed' : 'pending'}">
                                            <i class="fas fa-${isCompleted ? 'check-circle' : 'clock'}"></i>
                                            <span>${subject}: ${subjectData ? subjectData.questionCount : 0}/${event.questionsPerSubject}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                            
                            <div class="event-actions">
                                <button class="btn btn-outline" onclick="viewEventDetails('${event._id}')">
                                    <i class="fas fa-eye"></i>
                                    View Details
                                </button>
                                <button class="btn btn-secondary" onclick="viewEventResponses('${event._id}')">
                                    <i class="fas fa-chart-bar"></i>
                                    Responses
                                </button>
                                ${event.status === 'completed' ? `
                                    <button class="btn btn-primary" onclick="publishEvent('${event._id}')">
                                        <i class="fas fa-share"></i>
                                        Publish
                                    </button>
                                ` : ''}
                                <button class="btn btn-error" onclick="deleteEvent('${event._id}', '${event.title}')">
                                    <i class="fas fa-trash"></i>
                                    Delete
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        container.innerHTML = eventsHTML;
    }

    function displayTeachers(teachers) {
        const container = document.getElementById('teachersContainer');
        
        if (teachers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-plus"></i>
                    <h3>No Teachers Registered</h3>
                    <p>Teachers need to register before they can contribute to JAMB Mock events.</p>
                </div>
            `;
            return;
        }

        const teachersHTML = `
            <div class="teachers-grid">
                ${teachers.map(teacher => `
                    <div class="teacher-card">
                        <div class="teacher-header">
                            <div class="teacher-avatar">
                                ${teacher.name.charAt(0).toUpperCase()}
                            </div>
                            <div class="teacher-info">
                                <h4>${teacher.name}</h4>
                                <span class="teacher-subject">${teacher.subject}</span>
                            </div>
                        </div>
                        
                        <div class="teacher-stats">
                            <div class="teacher-stat">
                                <div class="teacher-stat-number">${teacher.quizCount || 0}</div>
                                <div class="teacher-stat-label">Quizzes</div>
                            </div>
                            <div class="teacher-stat">
                                <div class="teacher-stat-number">${teacher.eventParticipation || 0}</div>
                                <div class="teacher-stat-label">Events</div>
                            </div>
                        </div>
                        
                        <div class="meta-item" style="margin-top: 1rem;">
                            <i class="fas fa-envelope"></i>
                            <span>${teacher.email}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.innerHTML = teachersHTML;
    }

    function calculateEventProgress(event) {
        console.log('Calculating progress for event:', event.title);
        console.log('Event subjects:', event.subjects);
        
        if (!event.subjects || !Array.isArray(event.subjects)) {
            console.log('No subjects found, returning 0 progress');
            return { totalRequired: event.questionsPerSubject * 5, totalCompleted: 0, percentage: 0 };
        }
        
        const totalRequired = event.questionsPerSubject * 5; // 5 subjects
        const totalCompleted = event.subjects.reduce((sum, subject) => sum + subject.questionCount, 0);
        const percentage = Math.round((totalCompleted / totalRequired) * 100);
        
        console.log(`Progress: ${totalCompleted}/${totalRequired} = ${percentage}%`);
        return { totalRequired, totalCompleted, percentage };
    }

    function getEventStatusClass(event) {
        return event.status;
    }

    function openCreateEventModal() {
        // Set default deadline to 7 days from now
        const defaultDeadline = new Date();
        defaultDeadline.setDate(defaultDeadline.getDate() + 7);
        document.getElementById('eventDeadline').value = defaultDeadline.toISOString().slice(0, 16);
        
        createEventModal.style.display = 'block';
    }

    function closeCreateEventModal() {
        createEventModal.style.display = 'none';
        createEventForm.reset();
    }

    async function createEvent(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const eventData = {
            title: formData.get('title'),
            description: formData.get('description'),
            timeLimit: parseInt(formData.get('timeLimit')),
            questionsPerSubject: parseInt(formData.get('questionsPerSubject')),
            deadline: formData.get('deadline')
        };

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> Creating Event...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/host/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData)
            });

            const result = await response.json();

            if (response.ok) {
                showAlert('JAMB Mock event created successfully! Teachers have been notified.', 'success');
                closeCreateEventModal();
                setTimeout(() => {
                    loadDashboardData();
                }, 2000);
            } else {
                showAlert(result.error || 'Failed to create event', 'error');
            }
        } catch (error) {
            showAlert('Network error. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalBtnContent;
            submitBtn.disabled = false;
        }
    }

    // Global functions for event actions
    window.viewEventDetails = function(eventId) {
        window.location.href = `/host/event-details/${eventId}`;
    };

    window.viewEventResponses = function(eventId) {
        window.location.href = `/host/event-responses/${eventId}`;
    };

    window.copyEventLink = function(shareId) {
        const link = `${window.location.origin}/jamb-mock/${shareId}`;
        navigator.clipboard.writeText(link).then(() => {
            showAlert('JAMB Mock link copied to clipboard!', 'success');
        }).catch(() => {
            prompt('Copy this JAMB Mock link:', link);
        });
    };

    window.copyQuizLink = function(shareId) {
        const link = `${window.location.origin}/quiz/${shareId}`;
        navigator.clipboard.writeText(link).then(() => {
            showAlert('Quiz link copied to clipboard!', 'success');
        }).catch(() => {
            prompt('Copy this quiz link:', link);
        });
    };
    window.publishEvent = async function(eventId) {
        const confirmed = confirm('Are you sure you want to publish this JAMB Mock event? Once published, students can take the exam.');
        
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/host/events/${eventId}/publish`, {
                method: 'POST'
            });

            const result = await response.json();

            if (response.ok) {
                showAlert('Event published successfully! Students can now access the JAMB Mock.', 'success');
                setTimeout(() => {
                    loadDashboardData();
                }, 2000);
            } else {
                showAlert(result.error || 'Failed to publish event', 'error');
            }
        } catch (error) {
            showAlert('Network error. Please try again.', 'error');
        }
    };

    window.deleteEvent = async function(eventId, eventTitle) {
        const confirmed = confirm(`Are you sure you want to delete the event "${eventTitle}"?\n\nThis action will:\n• Delete the event permanently\n• Delete all associated questions\n• Delete all student responses\n• Cannot be undone\n\nClick OK to confirm deletion.`);
        
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/host/events/${eventId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                showAlert('Event deleted successfully!', 'success');
                setTimeout(() => {
                    loadDashboardData();
                }, 1500);
            } else {
                showAlert(result.error || 'Failed to delete event', 'error');
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
            await fetch('/api/host/logout', { method: 'POST' });
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/';
        }
    }
});
// Replace the loadDashboardData function in your host-dashboard.html with this updated version:

async function loadDashboardData() {
    try {
        console.log('Loading dashboard data...');
        
        // Load events
        const eventsResponse = await fetch('/api/host/events');
        console.log('Events response status:', eventsResponse.status);
        
        if (!eventsResponse.ok) {
            throw new Error('Failed to load events');
        }
        
        const eventsData = await eventsResponse.json();
        console.log('Events data received:', eventsData);
        const events = Array.isArray(eventsData) ? eventsData : [];
        console.log('Processed events array:', events.length);
        
        // Load teachers
        const teachersResponse = await fetch('/api/host/teachers');
        console.log('Teachers response status:', teachersResponse.status);
        
        if (!teachersResponse.ok) {
            throw new Error('Failed to load teachers');
        }
        
        const teachersData = await teachersResponse.json();
        console.log('Teachers data received:', teachersData);
        const teachers = Array.isArray(teachersData) ? teachersData : [];
        console.log('Processed teachers array:', teachers.length);

        // Load teacher quizzes
        const quizzesResponse = await fetch('/api/host/teacher-quizzes');
        console.log('Teacher quizzes response status:', quizzesResponse.status);
        
        let teacherQuizzes = [];
        if (quizzesResponse.ok) {
            const quizzesData = await quizzesResponse.json();
            console.log('Teacher quizzes data received:', quizzesData);
            teacherQuizzes = Array.isArray(quizzesData) ? quizzesData : [];
        } else {
            console.error('Failed to load teacher quizzes');
        }

        // Load quiz responses summary
        const responsesResponse = await fetch('/api/host/quiz-responses-summary');
        let totalResponses = 0;
        if (responsesResponse.ok) {
            const responsesData = await responsesResponse.json();
            totalResponses = responsesData.totalResponses || 0;
        }

        // Calculate statistics
        const activeEvents = events.filter(event => event.status === 'active').length;
        const totalQuestions = events.reduce((sum, event) => sum + event.totalQuestions, 0);

        // Update statistics
        document.getElementById('totalEvents').textContent = events.length;
        document.getElementById('activeEvents').textContent = activeEvents;
        document.getElementById('totalQuestions').textContent = totalQuestions;
        document.getElementById('totalTeachers').textContent = teachers.length;
        document.getElementById('totalResponses').textContent = totalResponses;

        displayEvents(events);
        displayTeachers(teachers);
        displayTeacherQuizzes(teacherQuizzes);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showAlert('Error loading dashboard data', 'error');
    }
}

// Add this new function to display teacher quizzes
function displayTeacherQuizzes(quizzes) {
    const container = document.getElementById('teacherQuizzesContainer');
    
    console.log('Displaying teacher quizzes:', quizzes.length);
    
    if (quizzes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>No Teacher Quizzes Found</h3>
                <p>Teachers haven't created any individual quizzes yet. Encourage them to create practice quizzes for their subjects.</p>
            </div>
        `;
        return;
    }

    const quizzesHTML = `
        <div class="quiz-grid">
            ${quizzes.map(quiz => {
                const createdDate = new Date(quiz.createdAt).toLocaleDateString();
                const teacher = quiz.teacherId;
                
                return `
                    <div class="quiz-card">
                        <div class="quiz-header">
                            <div class="quiz-info">
                                <h4 class="quiz-title">${quiz.title}</h4>
                                <span class="quiz-subject">${quiz.subject}</span>
                            </div>
                            <div class="quiz-stats-summary">
                                <div class="stat-badge">
                                    <i class="fas fa-users"></i>
                                    ${quiz.responseCount}
                                </div>
                            </div>
                        </div>
                        
                        <div class="quiz-teacher">
                            <div class="teacher-avatar-small">
                                ${teacher ? teacher.name.charAt(0).toUpperCase() : 'T'}
                            </div>
                            <div class="teacher-details">
                                <div class="teacher-name">${teacher ? teacher.name : 'Unknown Teacher'}</div>
                                <div class="teacher-email">${teacher ? teacher.email : 'No email'}</div>
                            </div>
                        </div>
                        
                        <div class="quiz-metadata">
                            <div class="meta-row">
                                <div class="meta-item">
                                    <i class="fas fa-list-ol"></i>
                                    <span>${quiz.questionCount} questions</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-clock"></i>
                                    <span>${quiz.timeLimit > 0 ? quiz.timeLimit + ' min' : 'No limit'}</span>
                                </div>
                            </div>
                            <div class="meta-row">
                                <div class="meta-item">
                                    <i class="fas fa-calendar-plus"></i>
                                    <span>Created: ${createdDate}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-chart-line"></i>
                                    <span>Avg: ${quiz.averageScore}%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="quiz-actions">
                            <button class="btn btn-outline btn-sm" onclick="copyQuizLink('${quiz.shareId}')">
                                <i class="fas fa-link"></i>
                                Copy Link
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="viewQuizResults('${quiz._id}')">
                                <i class="fas fa-chart-bar"></i>
                                View Results
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    container.innerHTML = quizzesHTML;
}

// Add this global function for viewing quiz results
window.viewQuizResults = function(quizId) {
    window.location.href = `/quiz-results/${quizId}`;
};