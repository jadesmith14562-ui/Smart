document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('hostLoginForm');
    const alertContainer = document.getElementById('alert-container');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const data = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> Logging in...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/host/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            console.log('Host login response:', result);

            if (response.ok) {
                showAlert('Login successful! Redirecting to host dashboard...', 'success');
                // Wait longer to ensure cookie is properly set
                setTimeout(() => {
                    window.location.href = '/host-dashboard';
                }, 2500);
            } else {
                showAlert(result.error || 'Login failed', 'error');
            }
        } catch (error) {
            showAlert('Network error. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalBtnContent;
            submitBtn.disabled = false;
        }
    });

    function showAlert(message, type) {
        alertContainer.innerHTML = `
            <div class="alert alert-${type}">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                ${message}
            </div>
        `;
        
        setTimeout(() => {
            alertContainer.innerHTML = '';
        }, 5000);
    }
});