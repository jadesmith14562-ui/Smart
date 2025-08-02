 // Create floating particles
        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            const particleCount = 30;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 6 + 's';
                particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
                particlesContainer.appendChild(particle);
            }
        }

        // Initialize particles
        createParticles();

        // Hamburger Menu Toggle
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        const body = document.body;

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
        });

        // Close menu when clicking on a link
        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                body.style.overflow = 'auto';
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                body.style.overflow = 'auto';
            }
        });

        // Hero Background Slider with enhanced transitions
        const backgrounds = document.querySelectorAll('.hero-background');
        let currentBg = 0;

        function changeBackground() {
            backgrounds.forEach(bg => bg.classList.remove('active'));
            backgrounds[currentBg].classList.add('active');
            currentBg = (currentBg + 1) % backgrounds.length;
        }

        // Initialize first background
        changeBackground();

        // Change background every 6 seconds
        setInterval(changeBackground, 6000);

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

        // Enhanced header background opacity on scroll
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            const scrolled = window.scrollY;
            
            if (scrolled > 100) {
                header.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.98) 0%, rgba(118, 75, 162, 0.98) 100%)';
                header.style.boxShadow = '0 2px 30px rgba(0,0,0,0.2)';
            } else {
                header.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)';
                header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
            }
        });

        // Enhanced stats animation with intersection observer
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumbers = entry.target.querySelectorAll('.stat-number');
                    statNumbers.forEach(stat => {
                        const finalValue = parseInt(stat.textContent.replace(/\D/g, ''));
                        const suffix = stat.textContent.replace(/\d/g, '');
                        let currentValue = 0;
                        const increment = finalValue / 60;
                        
                        const counter = setInterval(() => {
                            currentValue += increment;
                            if (currentValue >= finalValue) {
                                stat.textContent = finalValue + suffix;
                                clearInterval(counter);
                            } else {
                                stat.textContent = Math.floor(currentValue) + suffix;
                            }
                        }, 25);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            observer.observe(statsSection);
        }

        // Card hover effects with mouse tracking
        const cards = document.querySelectorAll('.about-card, .testimonial-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            });
        });

        // Parallax effect for hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.hero-background');
            
            parallaxElements.forEach(element => {
                const speed = 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });

        // Add interactive cursor effect
        document.addEventListener('mousemove', (e) => {
            const cursor = document.querySelector('.cursor');
            if (!cursor) {
                const newCursor = document.createElement('div');
                newCursor.className = 'cursor';
                newCursor.style.cssText = `
                    position: fixed;
                    width: 20px;
                    height: 20px;
                    background: radial-gradient(circle, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    transition: transform 0.1s ease;
                `;
                document.body.appendChild(newCursor);
            }
            
            const cursorElement = document.querySelector('.cursor');
            cursorElement.style.left = e.clientX - 10 + 'px';
            cursorElement.style.top = e.clientY - 10 + 'px';
        });

        // Enhanced testimonial card interactions
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        testimonialCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.2}s`;
            card.style.animation = 'fadeInUp 0.6s ease-out forwards';
        });

        // Add scroll-triggered animations
        const scrollElements = document.querySelectorAll('.section-title, .about-card, .testimonial-card');
        
        const elementInView = (el, dividend = 1) => {
            const elementTop = el.getBoundingClientRect().top;
            return (
                elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend
            );
        };

        const displayScrollElement = (element) => {
            element.classList.add('scrolled');
        };

        const hideScrollElement = (element) => {
            element.classList.remove('scrolled');
        };

        const handleScrollAnimation = () => {
            scrollElements.forEach((el) => {
                if (elementInView(el, 1.25)) {
                    displayScrollElement(el);
                } else {
                    hideScrollElement(el);
                }
            });
        };

        window.addEventListener('scroll', handleScrollAnimation);

        // Add glowing effect to CTA button
        const ctaButton = document.querySelector('.cta-button');
        ctaButton.addEventListener('mouseenter', () => {
            ctaButton.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.6), 0 6px 20px rgba(255, 215, 0, 0.4)';
        });

        ctaButton.addEventListener('mouseleave', () => {
            ctaButton.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.3)';
        });

        // Dynamic particle movement based on scroll
        window.addEventListener('scroll', () => {
            const particles = document.querySelectorAll('.particle');
            const scrollTop = window.pageYOffset;
            
            particles.forEach((particle, index) => {
                const speed = (index % 3 + 1) * 0.1;
                particle.style.transform = `translateY(${scrollTop * speed}px)`;
            });
        });

        // Add typing effect to hero title
        const heroTitle = document.querySelector('.hero h1');
        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                heroTitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        // Start typing effect after page load
        setTimeout(typeWriter, 1000);

        // Add ripple effect to buttons
        function addRippleEffect() {
            const buttons = document.querySelectorAll('.cta-button, .nav-links a');
            
            buttons.forEach(button => {
                button.addEventListener('click', function(e) {
                    const ripple = document.createElement('span');
                    const rect = this.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;
                    
                    ripple.style.cssText = `
                        position: absolute;
                        width: ${size}px;
                        height: ${size}px;
                        left: ${x}px;
                        top: ${y}px;
                        background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%);
                        border-radius: 50%;
                        transform: scale(0);
                        animation: ripple 0.6s ease-out;
                        pointer-events: none;
                        z-index: 1;
                    `;
                    
                    this.style.position = 'relative';
                    this.style.overflow = 'hidden';
                    this.appendChild(ripple);
                    
                    setTimeout(() => {
                        ripple.remove();
                    }, 600);
                });
            });
        }

        // Add ripple animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        // Initialize ripple effect
        addRippleEffect();

        // Performance optimization - throttle scroll events
        let ticking = false;
        function updateScrollEffects() {
            handleScrollAnimation();
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        });