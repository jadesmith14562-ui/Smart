document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadEventsData();

    document.getElementById('logoutBtn').addEventListener('click', logout);

    async function checkAuthentication() {
        try {
            const response = await fetch('/api/verify');
            if (!response.ok) {
                window.location.href = '/teacher-login';
                return;
            }
            
            const data = await response.json();
            document.getElementById('teacherName').textContent = `${data.teacher.name}`;
            document.getElementById('teacherSubject').textContent = data.teacher.subject;
        } catch (error) {
            window.location.href = '/teacher-login';
        }
    }

    async function loadEventsData() {
        try {
            const response = await fetch('/api/teacher/events');
            const data = await response.json();
            
            // Ensure events is an array
            const events = Array.isArray(data.events) ? data.events : [];
            
            // Update statistics
            document.getElementById('totalEvents').textContent = events.length;
            document.getElementById('myContributions').textContent = data.myContributions;
            document.getElementById('pendingEvents').textContent = data.pendingEvents;

            displayEvents(events, data.teacherSubject);
        } catch (error) {
            console.error('Error loading events data:', error);
            showAlert('Error loading events data', 'error');
        }
    }

    function displayEvents(events, teacherSubject) {
        const container = document.getElementById('eventsContainer');
        
        if (events.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No Events Available</h3>
                    <p>There are currently no JAMB Mock events available for contribution. Check back later or contact the host.</p>
                </div>
            `;
            return;
        }

        const eventsHTML = `
            <div class="events-grid">
                ${events.map(event => {
                    const mySubjectData = event.subjects.find(s => s.subject === teacherSubject);
                    const myProgress = mySubjectData ? mySubjectData.questionCount : 0;
                    const isMySubjectComplete = myProgress >= event.questionsPerSubject;
                    const deadline = new Date(event.deadline);
                    const now = new Date();
                    const isUrgent = (deadline - now) < (24 * 60 * 60 * 1000); // Less than 24 hours
                    
                    return `
                        <div class="event-card">
                            ${!isMySubjectComplete && event.status === 'active' ? '<div class="notification-badge">!</div>' : ''}
                            
                            <div class="event-header">
                                <div>
                                    <h3 class="event-title">${event.title}</h3>
                                    <span class="event-status ${event.status}">${event.status}</span>
                                </div>
                            </div>
                            
                            ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
                            
                            ${isUrgent && !isMySubjectComplete ? `
                                <div class="deadline-warning ${isUrgent ? 'deadline-urgent' : ''}">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    <span>Deadline: ${deadline.toLocaleDateString()} at ${deadline.toLocaleTimeString()}</span>
                                </div>
                            ` : ''}
                            
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
                                    <span>Due: ${deadline.toLocaleDateString()}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-users"></i>
                                    <span>${event.totalQuestions} total questions</span>
                                </div>
                            </div>
                            
                            <div class="subject-contribution my-subject">
                                <div class="subject-header">
                                    <div class="subject-name">
                                        <div class="subject-icon ${teacherSubject.toLowerCase()}">
                                            ${getSubjectIcon(teacherSubject)}
                                        </div>
                                        ${teacherSubject}
                                    </div>
                                    <div class="subject-progress ${myProgress > 0 ? 'completed' : 'pending'}">
                                        <i class="fas fa-${myProgress > 0 ? 'check-circle' : 'clock'}"></i>
                                        ${myProgress} questions
                                    </div>
                                </div>
                                
                                <div class="progress-bar">
                                    <div class="progress-fill ${myProgress > 0 ? 'completed' : 'pending'}" 
                                         style="width: ${Math.min((myProgress / 50) * 100, 100)}%"></div>
                                </div>
                                
                                <div class="subject-actions">
                                    ${event.status === 'active' ? `
                                        <button class="btn btn-primary" onclick="contributeQuestions('${event._id}')">
                                            <i class="fas fa-${myProgress > 0 ? 'edit' : 'plus'}"></i>
                                            ${myProgress > 0 ? 'Edit Questions' : 'Add Questions'}
                                        </button>
                                    ` : ''}
                                    ${myProgress > 0 ? `
                                        <button class="btn btn-outline" onclick="viewMyQuestions('${event._id}')">
                                            <i class="fas fa-eye"></i>
                                            View My Questions
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                            
                            <div class="event-actions">
                                <button class="btn btn-outline" onclick="viewEventDetails('${event._id}')">
                                    <i class="fas fa-info-circle"></i>
                                    Event Details
                                </button>
                                ${event.status === 'published' ? `
                                    <button class="btn btn-secondary" onclick="viewEventLink('${event.shareId}')">
                                        <i class="fas fa-external-link-alt"></i>
                                        Student Link
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        container.innerHTML = eventsHTML;
    }

    function getSubjectIcon(subject) {
        const icons = {
            'Mathematics': '∑',
            'English': 'En',
            'Physics': 'Φ',
            'Chemistry': 'Ch',
            'Biology': 'Bio'
        };
        return icons[subject] || subject.charAt(0);
    }

    // Global functions for event actions
    window.contributeQuestions = function(eventId) {
        window.location.href = `/teacher/event-contribute/${eventId}`;
    };

    window.viewMyQuestions = function(eventId) {
        window.location.href = `/teacher/event-questions/${eventId}`;
    };

    window.viewEventDetails = function(eventId) {
        window.location.href = `/teacher/event-details/${eventId}`;
    };

    window.viewEventLink = function(shareId) {
        const link = `${window.location.origin}/jamb-mock/${shareId}`;
        navigator.clipboard.writeText(link).then(() => {
            showAlert('Event link copied to clipboard!', 'success');
        }).catch(() => {
            prompt('Copy this link:', link);
        });
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