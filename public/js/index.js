let currentBackground = 0;
        const backgrounds = document.querySelectorAll('.hero-background');
        const totalBackgrounds = backgrounds.length;

        function changeBackground() {
            // Remove active class from current background
            backgrounds[currentBackground].classList.remove('active');
            
            // Move to next background
            currentBackground = (currentBackground + 1) % totalBackgrounds;
            
            // Add active class to new background
            backgrounds[currentBackground].classList.add('active');
        }

        // Change background every 4 seconds
        setInterval(changeBackground, 4000);

        // Initialize first background as active
        backgrounds[0].classList.add('active');

        // Hamburger menu functionality
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');

        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
           
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });

        // Navbar scroll effect
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Smooth scrolling for navigation links
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

        // Animate stats on scroll
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumbers = entry.target.querySelectorAll('.stat-item h3');
                    statNumbers.forEach(stat => {
                        const finalNumber = stat.textContent;
                        const isPercentage = finalNumber.includes('%');
                        const isPlus = finalNumber.includes('+');
                        const cleanNumber = parseInt(finalNumber.replace(/[^\d]/g, ''));
                        
                        let currentNumber = 0;
                        const increment = cleanNumber / 50;
                        
                        const timer = setInterval(() => {
                            currentNumber += increment;
                            if (currentNumber >= cleanNumber) {
                                currentNumber = cleanNumber;
                                clearInterval(timer);
                            }
                            
                            let displayNumber = Math.floor(currentNumber);
                            if (isPercentage) {
                                displayNumber += '%';
                            } else if (isPlus) {
                                displayNumber = displayNumber.toLocaleString() + '+';
                            } else {
                                displayNumber = displayNumber.toLocaleString();
                            }
                            
                            stat.textContent = displayNumber;
                        }, 50);
                    });
                }
            });
        }, observerOptions);

        const statsSection = document.querySelector('.stats');
        if (statsSection) {
            observer.observe(statsSection);
        }

        // Add scroll to top functionality
        let scrollToTopBtn = document.createElement('button');
        scrollToTopBtn.innerHTML = '↑';
        scrollToTopBtn.setAttribute('id', 'scrollToTop');
        scrollToTopBtn.style.cssText = `
            position: fixed;
            display: none;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 1.5rem;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        `;
        document.body.appendChild(scrollToTopBtn);

        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.style.opacity = '1';
                scrollToTopBtn.style.visibility = 'visible';
            } else {
                scrollToTopBtn.style.opacity = '0';
                scrollToTopBtn.style.visibility = 'hidden';
            }
        });

        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Add hover effects
        scrollToTopBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });

        scrollToTopBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });