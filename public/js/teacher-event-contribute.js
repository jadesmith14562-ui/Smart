document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    
    const eventId = window.location.pathname.split('/').pop();
    let eventData = null;
    let teacherData = null;
    let questionCount = 0;
    let existingQuestions = [];

    // DOM Elements
    const loadingContainer = document.getElementById('loadingContainer');
    const contributeContainer = document.getElementById('contributeContainer');
    const errorContainer = document.getElementById('errorContainer');
    const eventInfoBanner = document.getElementById('eventInfo');
    const subjectLabel = document.getElementById('subjectLabel');
    const questionsContainer = document.getElementById('questionsContainer');
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    const contributeForm = document.getElementById('contributeForm');

    // Event Listeners
    addQuestionBtn.addEventListener('click', addQuestion);
    contributeForm.addEventListener('submit', saveQuestions);
    document.getElementById('logoutBtn').addEventListener('click', logout);

    loadEventData();

    async function checkAuthentication() {
        try {
            const response = await fetch('/api/verify');
            if (!response.ok) {
                window.location.href = '/teacher-login';
                return;
            }
            
            teacherData = await response.json();
        } catch (error) {
            window.location.href = '/teacher-login';
        }
    }

    async function loadEventData() {
        try {
            const response = await fetch(`/api/teacher/events/${eventId}`);
            
            if (!response.ok) {
                throw new Error('Event not found');
            }

            const data = await response.json();
            eventData = data.event;
            existingQuestions = data.existingQuestions || [];
            
            loadingContainer.classList.add('hidden');
            displayEventInfo();
            loadExistingQuestions();
            contributeContainer.classList.remove('hidden');
            
        } catch (error) {
            loadingContainer.classList.add('hidden');
            errorContainer.classList.remove('hidden');
        }
    }

    function displayEventInfo() {
        const deadline = new Date(eventData.deadline);
        const now = new Date();
        const timeLeft = deadline - now;
        const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
        
        const mySubjectData = eventData.subjects.find(s => s.subject === teacherData.teacher.subject);
        const myProgress = mySubjectData ? mySubjectData.questionCount : 0;
        
        eventInfoBanner.innerHTML = `
            <div class="event-info-card">
                <div class="event-info-header">
                    <h2>${eventData.title}</h2>
                    <span class="event-status ${eventData.status}">${eventData.status}</span>
                </div>
                <div class="event-info-details">
                    <div class="info-item">
                        <i class="fas fa-book"></i>
                        <span>Subject: <strong>${teacherData.teacher.subject}</strong></span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-list-ol"></i>
                        <span>Required: <strong>${eventData.questionsPerSubject} questions</strong></span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-check-circle"></i>
                        <span>Completed: <strong>${myProgress}/${eventData.questionsPerSubject}</strong></span>
                    </div>
                    <div class="info-item ${daysLeft <= 1 ? 'urgent' : ''}">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Deadline: <strong>${deadline.toLocaleDateString()}</strong> (${daysLeft} days left)</span>
                    </div>
                </div>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(myProgress / eventData.questionsPerSubject) * 100}%"></div>
                    </div>
                    <div class="progress-text">${myProgress}/${eventData.questionsPerSubject} questions completed</div>
                </div>
            </div>
        `;

        subjectLabel.innerHTML = `<i class="fas fa-question-circle"></i> ${teacherData.teacher.subject} Questions`;
    }

    function loadExistingQuestions() {
        if (existingQuestions.length > 0) {
            existingQuestions.forEach((question, index) => {
                addQuestion(question, index + 1);
            });
        } else {
            // Add first empty question
            addQuestion();
        }
    }

    function addQuestion(existingQuestion = null, questionNumber = null) {
        questionCount = questionNumber || (questionCount + 1);
        
        const questionHTML = `
            <div class="question-item" id="question-${questionCount}">
                <div class="form-group">
                    <label class="form-label">
                        <i class="fas fa-question-circle"></i>
                        Question ${questionCount}
                    </label>
                    <input type="text" name="question-${questionCount}" class="form-input" required 
                           placeholder="Enter your ${teacherData.teacher.subject} question"
                           value="${existingQuestion ? existingQuestion.question : ''}">
                </div>
                
                <div class="form-group" data-question="${questionCount}">
                    <label class="form-label">
                        <i class="fas fa-image"></i>
                        Question Images (Optional, up to 3)
                    </label>
                    <div class="image-upload-container">
                        <div class="image-upload-area">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <span>Drag and drop or click to upload images (max 3)</span>
                            <input type="file" class="image-input" accept="image/*" multiple>
                        </div>
                        <div class="image-preview-container">
                            ${existingQuestion && existingQuestion.imageUrls ? 
                                existingQuestion.imageUrls.map((url, idx) => `
                                    <div class="image-preview">
                                        <img src="${url}" alt="Question image ${idx + 1}">
                                        <button type="button" class="image-remove-btn btn btn-error btn-small" data-index="${idx}">
                                            <i class="fas fa-trash"></i> Remove Image
                                        </button>
                                    </div>
                                `).join('') : ''
                            }
                        </div>
                        <input type="hidden" class="image-urls-input" name="image-urls-${questionCount}" 
                               value="${existingQuestion && existingQuestion.imageUrls ? existingQuestion.imageUrls.join(',') : ''}">
                        <input type="hidden" class="image-public-ids-input" name="image-public-ids-${questionCount}"
                               value="${existingQuestion && existingQuestion.imagePublicIds ? existingQuestion.imagePublicIds.join(',') : ''}">
                    </div>
                </div>
                
                <div class="option-group">
                    <label class="form-label">
                        <i class="fas fa-list"></i>
                        Options (Select the correct answer)
                    </label>
                    
                    ${[0, 1, 2, 3].map(optionIndex => `
                        <div class="option-item">
                            <input type="radio" name="correct-${questionCount}" value="${optionIndex}" required
                                   ${existingQuestion && existingQuestion.correctAnswer === optionIndex ? 'checked' : ''}>
                            <input type="text" name="option-${questionCount}-${optionIndex}" class="form-input" required 
                                   placeholder="Option ${String.fromCharCode(65 + optionIndex)}"
                                   value="${existingQuestion && existingQuestion.options[optionIndex] ? existingQuestion.options[optionIndex] : ''}">
                        </div>
                    `).join('')}
                </div>

                <div class="text-right">
                    <button type="button" class="btn btn-error" onclick="removeQuestion(${questionCount})">
                        <i class="fas fa-trash"></i>
                        Remove Question
                    </button>
                </div>
            </div>
        `;
        
        questionsContainer.insertAdjacentHTML('beforeend', questionHTML);
        initializeImageUpload(questionCount);
    }

    function initializeImageUpload(questionId) {
        const container = document.querySelector(`[data-question="${questionId}"]`);
        const fileInput = container.querySelector('.image-input');
        const uploadArea = container.querySelector('.image-upload-area');
        const previewContainer = container.querySelector('.image-preview-container');
        const urlsInput = container.querySelector('.image-urls-input');
        const publicIdsInput = container.querySelector('.image-public-ids-input');

        let currentImages = [];
        
        // Load existing images
        if (urlsInput.value) {
            const urls = urlsInput.value.split(',').filter(url => url);
            const publicIds = publicIdsInput.value.split(',').filter(id => id);
            currentImages = urls.map((url, index) => ({
                url,
                publicId: publicIds[index] || ''
            }));
        }

        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            handleImageUpload(files);
        });

        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            handleImageUpload(files);
        });

        function updatePreview() {
            const existingPreviews = previewContainer.querySelectorAll('.image-preview');
            existingPreviews.forEach(preview => {
                const removeBtn = preview.querySelector('.image-remove-btn');
                removeBtn.addEventListener('click', async () => {
                    const index = parseInt(removeBtn.dataset.index);
                    const publicId = currentImages[index].publicId;
                    if (publicId) {
                        try {
                            await fetch(`/api/delete-image/${publicId}`, { method: 'DELETE' });
                        } catch (error) {
                            console.error('Error deleting image:', error);
                        }
                    }
                    currentImages.splice(index, 1);
                    updateInputs();
                    updatePreview();
                });
            });

            uploadArea.style.display = currentImages.length >= 3 ? 'none' : 'block';
        }

        function updateInputs() {
            urlsInput.value = currentImages.map(img => img.url).join(',');
            publicIdsInput.value = currentImages.map(img => img.publicId).join(',');
        }

        async function handleImageUpload(files) {
            const newFiles = files.filter(file => file.type.startsWith('image/'));
            if (newFiles.length === 0) {
                showAlert('Please select image files', 'error');
                return;
            }

            if (currentImages.length + newFiles.length > 3) {
                showAlert('Maximum of 3 images per question allowed', 'error');
                return;
            }

            for (const file of newFiles) {
                if (file.size > 5 * 1024 * 1024) {
                    showAlert('Each image must be less than 5MB', 'error');
                    return;
                }
            }

            uploadArea.style.display = 'none';
            const progress = document.createElement('div');
            progress.className = 'upload-progress';
            progress.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%;"></div>
                </div>
                <span class="progress-text">Uploading...</span>
            `;
            container.appendChild(progress);

            try {
                const formData = new FormData();
                newFiles.forEach(file => formData.append('images', file));

                const response = await fetch('/api/upload-image', {
                    method: 'POST',
                    body: formData
                });

                const results = await response.json();

                if (response.ok) {
                    results.forEach(result => {
                        currentImages.push({ url: result.imageUrl, publicId: result.publicId });
                    });
                    updateInputs();
                    updatePreview();
                    showAlert('Images uploaded successfully!', 'success');
                } else {
                    throw new Error(results.error || 'Upload failed');
                }
            } catch (error) {
                console.error('Upload error:', error);
                showAlert('Error uploading images: ' + error.message, 'error');
            } finally {
                progress.remove();
                uploadArea.style.display = currentImages.length >= 3 ? 'none' : 'block';
            }
        }

        // Initialize existing images
        updatePreview();
    }

    window.removeQuestion = async function(questionId) {
        if (questionCount <= 1) {
            showAlert('Event must have at least one question', 'warning');
            return;
        }
        
        const questionElement = document.getElementById(`question-${questionId}`);
        const publicIdsInput = questionElement.querySelector(`input[name="image-public-ids-${questionId}"]`);
        
        if (publicIdsInput && publicIdsInput.value) {
            const publicIds = publicIdsInput.value.split(',');
            for (const publicId of publicIds) {
                if (publicId) {
                    try {
                        await fetch(`/api/delete-image/${publicId}`, { method: 'DELETE' });
                    } catch (error) {
                        console.error('Error deleting image:', error);
                    }
                }
            }
        }
        
        questionElement.remove();
        renumberQuestions();
    };

    function renumberQuestions() {
        const questions = document.querySelectorAll('.question-item');
        questions.forEach((question, index) => {
            const newNumber = index + 1;
            question.id = `question-${newNumber}`;
            
            const label = question.querySelector('.form-label');
            label.innerHTML = `<i class="fas fa-question-circle"></i> Question ${newNumber}`;
            
            const questionInput = question.querySelector('input[type="text"]');
            if (questionInput) questionInput.name = `question-${newNumber}`;
            
            const radioInputs = question.querySelectorAll('input[type="radio"]');
            radioInputs.forEach(radio => {
                radio.name = `correct-${newNumber}`;
            });
            
            const optionInputs = question.querySelectorAll('input[type="text"]:not(:first-child)');
            optionInputs.forEach((input, optionIndex) => {
                input.name = `option-${newNumber}-${optionIndex}`;
            });
            
            const imageContainer = question.querySelector('[data-question]');
            if (imageContainer) imageContainer.dataset.question = newNumber;
            
            const imageUrlsInput = question.querySelector('.image-urls-input');
            if (imageUrlsInput) imageUrlsInput.name = `image-urls-${newNumber}`;
            
            const imagePublicIdsInput = question.querySelector('.image-public-ids-input');
            if (imagePublicIdsInput) imagePublicIdsInput.name = `image-public-ids-${newNumber}`;
            
            const removeBtn = question.querySelector('.btn-error');
            if (removeBtn) removeBtn.setAttribute('onclick', `removeQuestion(${newNumber})`);
        });
        
        questionCount = questions.length;
    }

    async function saveQuestions(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const questions = [];
        
        for (let i = 1; i <= questionCount; i++) {
            const question = formData.get(`question-${i}`);
            if (question) {
                const options = [
                    formData.get(`option-${i}-0`),
                    formData.get(`option-${i}-1`),
                    formData.get(`option-${i}-2`),
                    formData.get(`option-${i}-3`)
                ];
                const correctAnswer = parseInt(formData.get(`correct-${i}`));
                const imageUrls = formData.get(`image-urls-${i}`)?.split(',').filter(url => url) || [];
                const imagePublicIds = formData.get(`image-public-ids-${i}`)?.split(',').filter(id => id) || [];
                
                questions.push({
                    question,
                    options,
                    correctAnswer,
                    imageUrls,
                    imagePublicIds
                });
            }
        }

        if (questions.length === 0) {
            showAlert('Please add at least one question', 'error');
            return;
        }

        if (questions.length > eventData.questionsPerSubject) {
            showAlert(`Maximum ${eventData.questionsPerSubject} questions allowed for this event`, 'error');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> Saving Questions...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(`/api/teacher/events/${eventId}/contribute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ questions })
            });

            const result = await response.json();

            if (response.ok) {
                showAlert('Questions saved successfully! Redirecting to events...', 'success');
                setTimeout(() => {
                    window.location.href = '/teacher-events';
                }, 2000);
            } else {
                showAlert(result.error || 'Failed to save questions', 'error');
            }
        } catch (error) {
            showAlert('Network error. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalBtnContent;
            submitBtn.disabled = false;
        }
    }

    function showAlert(message, type) {
        const alertContainer = document.getElementById('alert-container');
        alertContainer.innerHTML = `
            <div class="alert alert-${type}">
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