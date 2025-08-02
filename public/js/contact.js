// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Add overlay for mobile menu
const overlay = document.createElement('div');
overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
`;
document.body.appendChild(overlay);

hamburger.addEventListener('click', () => {
    if (navMenu.classList.contains('active')) {
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
    } else {
        overlay.style.opacity = '1';
        overlay.style.visibility = 'visible';
    }
});

overlay.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    overlay.style.opacity = '0';
    overlay.style.visibility = 'hidden';
});

// Beautiful popup modal
function createPopupModal() {
    const modal = document.createElement('div');
    modal.className = 'popup-modal';
    modal.innerHTML = `
        <div class="popup-overlay"></div>
        <div class="popup-content">
            <div class="popup-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2 class="popup-title">Form Submitted!</h2>
            <p class="popup-message">Thank you for contacting us. We will get back to you within 24 hours.</p>
            <button class="popup-close-btn" onclick="closePopup()">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function showSuccessPopup(message) {
    const existingModal = document.querySelector('.popup-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = createPopupModal();
    const messageElement = modal.querySelector('.popup-message');
    messageElement.textContent = message;

    // Trigger animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    // Auto close after 5 seconds
    setTimeout(() => {
        closePopup();
    }, 5000);
}

function showErrorPopup(message) {
    const existingModal = document.querySelector('.popup-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = createPopupModal();
    const messageElement = modal.querySelector('.popup-message');
    const iconElement = modal.querySelector('.popup-icon i');
    const titleElement = modal.querySelector('.popup-title');
    
    messageElement.textContent = message;
    iconElement.className = 'fas fa-exclamation-triangle';
    iconElement.style.color = '#e74c3c';
    titleElement.textContent = 'Error';
    titleElement.style.color = '#e74c3c';

    // Trigger animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    // Auto close after 7 seconds for errors
    setTimeout(() => {
        closePopup();
    }, 7000);
}

function closePopup() {
    const modal = document.querySelector('.popup-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Form submission with backend integration
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.querySelector('.submit-btn');
    const originalBtnContent = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    try {
        // Get form data
        const formData = new FormData(this);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value.trim();
        }
        
        // Send to backend
        const response = await fetch('/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success popup
            showSuccessPopup(result.message);
            
            // Reset form
            this.reset();
            
            // Hide old success message if it exists
            const oldSuccessMessage = document.getElementById('successMessage');
            if (oldSuccessMessage) {
                oldSuccessMessage.classList.remove('show');
            }
        } else {
            // Show error popup
            showErrorPopup(result.message);
        }
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showErrorPopup('Network error. Please check your connection and try again.');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalBtnContent;
        submitBtn.disabled = false;
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Add hover effects to cards
const cards = document.querySelectorAll('.subject-card, .feature-card, .info-item');
cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Form validation enhancements
const formInputs = document.querySelectorAll('#contactForm input, #contactForm select, #contactForm textarea');
formInputs.forEach(input => {
    input.addEventListener('blur', function() {
        validateField(this);
    });
    
    input.addEventListener('input', function() {
        clearFieldError(this);
    });
});

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Remove existing error styling
    clearFieldError(field);
    
    // Validate required fields
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, `${getFieldLabel(fieldName)} is required`);
        return false;
    }
    
    // Email validation
    if (fieldName === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Phone validation (if provided)
    if (fieldName === 'phone' && value) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
    }
    
    return true;
}

function showFieldError(field, message) {
    field.style.borderColor = '#e74c3c';
    field.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
    
    // Create or update error message
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        field.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
}

function clearFieldError(field) {
    field.style.borderColor = '';
    field.style.boxShadow = '';
    
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

function getFieldLabel(fieldName) {
    const labels = {
        'name': 'Full Name',
        'email': 'Email Address',
        'phone': 'Phone Number',
        'subject': 'Subject',
        'message': 'Message'
    };
    return labels[fieldName] || fieldName;
}