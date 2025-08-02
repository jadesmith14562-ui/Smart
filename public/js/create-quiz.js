document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    
    let questionCount = 0;
    
    document.getElementById('addQuestionBtn').addEventListener('click', addQuestion);
    document.getElementById('addPassageBtn').addEventListener('click', addReadingPassage);
    document.getElementById('quizForm').addEventListener('submit', createQuiz);
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Add first question by default
    addQuestion();

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

    function addReadingPassage() {
        questionCount++;
        const questionsContainer = document.getElementById('questionsContainer');
        
        const passageHTML = `
            <div class="passage-item" id="question-${questionCount}">
                <div class="form-group">
                    <label class="form-label">
                        <i class="fas fa-book-open"></i>
                        Reading Passage ${questionCount}
                    </label>
                    <textarea name="passage-${questionCount}" class="form-input" required 
                              placeholder="Enter the reading passage here..." 
                              style="min-height: 200px; resize: vertical;"></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">
                        <i class="fas fa-list-ol"></i>
                        Number of Questions for this Passage
                    </label>
                    <select name="passage-questions-${questionCount}" class="form-input" required>
                        <option value="">Select number of questions</option>
                        <option value="3">3 Questions</option>
                        <option value="5">5 Questions</option>
                        <option value="7">7 Questions</option>
                        <option value="10">10 Questions</option>
                        <option value="15">15 Questions</option>
                    </select>
                </div>

                <div id="passage-questions-${questionCount}" class="passage-questions-container">
                    <!-- Questions will be added here dynamically -->
                </div>

                <div class="text-right">
                    <button type="button" class="btn btn-error" onclick="removeQuestion(${questionCount})">
                        <i class="fas fa-trash"></i>
                        Remove Passage
                    </button>
                </div>
            </div>
        `;
        
        questionsContainer.insertAdjacentHTML('beforeend', passageHTML);
        
        const questionCountSelect = document.querySelector(`select[name="passage-questions-${questionCount}"]`);
        questionCountSelect.addEventListener('change', function() {
            generatePassageQuestions(questionCount, parseInt(this.value));
        });
    }

    function generatePassageQuestions(passageId, questionCount) {
        const container = document.getElementById(`passage-questions-${passageId}`);
        container.innerHTML = '';
        
        if (!questionCount) return;
        
        for (let i = 1; i <= questionCount; i++) {
            const questionHTML = `
                <div class="question-item" style="margin-top: 2rem; border-left: 4px solid #667eea; padding-left: 1rem;">
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-question-circle"></i>
                            Question ${i}
                        </label>
                        <input type="text" name="passage-${passageId}-question-${i}" class="form-input" required 
                               placeholder="Enter question ${i} for this passage">
                    </div>
                    
                    <div class="form-group" data-question="passage-${passageId}-${i}">
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
                            <div class="image-preview-container"></div>
                            <input type="hidden" class="image-urls-input" name="passage-${passageId}-image-urls-${i}">
                            <input type="hidden" class="image-public-ids-input" name="passage-${passageId}-image-public-ids-${i}">
                        </div>
                    </div>
                    
                    <div class="option-group">
                        <label class="form-label">
                            <i class="fas fa-list"></i>
                            Options (Select the correct answer)
                        </label>
                        
                        <div class="option-item">
                            <input type="radio" name="passage-${passageId}-correct-${i}" value="0" required>
                            <input type="text" name="passage-${passageId}-option-${i}-0" class="form-input" required placeholder="Option A">
                        </div>
                        
                        <div class="option-item">
                            <input type="radio" name="passage-${passageId}-correct-${i}" value="1" required>
                            <input type="text" name="passage-${passageId}-option-${i}-1" class="form-input" required placeholder="Option B">
                        </div>
                        
                        <div class="option-item">
                            <input type="radio" name="passage-${passageId}-correct-${i}" value="2" required>
                            <input type="text" name="passage-${passageId}-option-${i}-2" class="form-input" required placeholder="Option C">
                        </div>
                        
                        <div class="option-item">
                            <input type="radio" name="passage-${passageId}-correct-${i}" value="3" required>
                            <input type="text" name="passage-${passageId}-option-${i}-3" class="form-input" required placeholder="Option D">
                        </div>
                    </div>
                </div>
            `;
            
            container.insertAdjacentHTML('beforeend', questionHTML);
            initializeImageUpload(`passage-${passageId}-${i}`);
        }
    }

    function addQuestion() {
        questionCount++;
        const questionsContainer = document.getElementById('questionsContainer');
        
        const questionHTML = `
            <div class="question-item" id="question-${questionCount}">
                <div class="form-group">
                    <label class="form-label">
                        <i class="fas fa-question-circle"></i>
                        Question ${questionCount}
                    </label>
                    <input type="text" name="question-${questionCount}" class="form-input" required placeholder="Enter your question">
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
                        <div class="image-preview-container"></div>
                        <input type="hidden" class="image-urls-input" name="image-urls-${questionCount}">
                        <input type="hidden" class="image-public-ids-input" name="image-public-ids-${questionCount}">
                    </div>
                </div>
                
                <div class="option-group">
                    <label class="form-label">
                        <i class="fas fa-list"></i>
                        Options (Select the correct answer)
                    </label>
                    
                    <div class="option-item">
                        <input type="radio" name="correct-${questionCount}" value="0" required>
                        <input type="text" name="option-${questionCount}-0" class="form-input" required placeholder="Option A">
                    </div>
                    
                    <div class="option-item">
                        <input type="radio" name="correct-${questionCount}" value="1" required>
                        <input type="text" name="option-${questionCount}-1" class="form-input" required placeholder="Option B">
                    </div>
                    
                    <div class="option-item">
                        <input type="radio" name="correct-${questionCount}" value="2" required>
                        <input type="text" name="option-${questionCount}-2" class="form-input" required placeholder="Option C">
                    </div>
                    
                    <div class="option-item">
                        <input type="radio" name="correct-${questionCount}" value="3" required>
                        <input type="text" name="option-${questionCount}-3" class="form-input" required placeholder="Option D">
                    </div>
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

    window.removeQuestion = async function(questionId) {
        if (questionCount <= 1) {
            showAlert('Quiz must have at least one question', 'warning');
            return;
        }
        
        const questionElement = document.getElementById(`question-${questionId}`);
        const publicIdsInput = questionElement.querySelector(`input[name="image-public-ids-${questionId}"], input[name*="image-public-ids-"]`);
        
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
        const questions = document.querySelectorAll('.question-item, .passage-item');
        questions.forEach((question, index) => {
            const newNumber = index + 1;
            question.id = `question-${newNumber}`;
            
            if (question.classList.contains('passage-item')) {
                const label = question.querySelector('.form-label');
                label.innerHTML = `<i class="fas fa-book-open"></i> Reading Passage ${newNumber}`;
                
                const passageTextarea = question.querySelector('textarea');
                if (passageTextarea) passageTextarea.name = `passage-${newNumber}`;
                
                const questionCountSelect = question.querySelector('select');
                if (questionCountSelect) questionCountSelect.name = `passage-questions-${newNumber}`;
                
                const questionsContainer = question.querySelector('.passage-questions-container');
                if (questionsContainer) questionsContainer.id = `passage-questions-${newNumber}`;
            } else {
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
            }
        });
        
        questionCount = questions.length;
    }

    function initializeImageUpload(questionId) {
        const container = document.querySelector(`[data-question="${questionId}"]`);
        const fileInput = container.querySelector('.image-input');
        const uploadArea = container.querySelector('.image-upload-area');
        const previewContainer = container.querySelector('.image-preview-container');
        const urlsInput = container.querySelector('.image-urls-input');
        const publicIdsInput = container.querySelector('.image-public-ids-input');

        let currentImages = [];

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
            previewContainer.innerHTML = '';
            currentImages.forEach((image, index) => {
                const preview = document.createElement('div');
                preview.className = 'image-preview';
                preview.innerHTML = `
                    <img src="${image.url}" alt="Question image preview ${index + 1}">
                    <button type="button" class="image-remove-btn btn btn-error btn-small" data-index="${index}">
                        <i class="fas fa-trash"></i> Remove Image
                    </button>
                `;
                previewContainer.appendChild(preview);
            });

            const removeButtons = previewContainer.querySelectorAll('.image-remove-btn');
            removeButtons.forEach(button => {
                button.addEventListener('click', async () => {
                    const index = parseInt(button.dataset.index);
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
    }

    async function createQuiz(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const title = formData.get('title');
        const timeLimit = parseInt(formData.get('timeLimit')) || 0;
        
        const questions = [];
        const passages = [];
        
        for (let i = 1; i <= questionCount; i++) {
            const passageText = formData.get(`passage-${i}`);
            if (passageText) {
                const passageQuestionCount = parseInt(formData.get(`passage-questions-${i}`));
                const passageQuestions = [];
                
                for (let j = 1; j <= passageQuestionCount; j++) {
                    const question = formData.get(`passage-${i}-question-${j}`);
                    const options = [
                        formData.get(`passage-${i}-option-${j}-0`),
                        formData.get(`passage-${i}-option-${j}-1`),
                        formData.get(`passage-${i}-option-${j}-2`),
                        formData.get(`passage-${i}-option-${j}-3`)
                    ];
                    const correctAnswer = parseInt(formData.get(`passage-${i}-correct-${j}`));
                    const imageUrls = formData.get(`passage-${i}-image-urls-${j}`)?.split(',').filter(url => url) || [];
                    const imagePublicIds = formData.get(`passage-${i}-image-public-ids-${j}`)?.split(',').filter(id => id) || [];
                    
                    passageQuestions.push({
                        question,
                        options,
                        correctAnswer,
                        passageId: `passage-${i}`,
                        imageUrls,
                        imagePublicIds
                    });
                }
                
                passages.push({
                    id: `passage-${i}`,
                    text: passageText,
                    questionCount: passageQuestionCount
                });
                
                questions.push(...passageQuestions);
            } else {
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
        }

        if (questions.length === 0) {
            showAlert('Please add at least one question', 'error');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> Creating Quiz...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, questions, passages, timeLimit })
            });

            const result = await response.json();

            if (response.ok) {
                showAlert('Quiz created successfully! Redirecting to dashboard...', 'success');
                setTimeout(() => {
                    window.location.href = '/teacher-dashboard';
                }, 2000);
            } else {
                showAlert(result.error || 'Failed to create quiz', 'error');
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