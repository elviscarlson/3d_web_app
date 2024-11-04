// static/js/animations/gsap/scrollAnimations.js

function initProcessAnimations() {
    const processItems = document.querySelectorAll('.process-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.3
    });
    
    processItems.forEach(item => observer.observe(item));
}

function initEnhancedProcessAnimations() {
    const processSection = document.querySelector('.process-section');
    const processItems = document.querySelectorAll('.process-item');
    
    // Parallax effect on scroll
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const sectionTop = processSection.offsetTop;
        const sectionHeight = processSection.offsetHeight;
        
        if (scrolled > sectionTop - window.innerHeight && 
            scrolled < sectionTop + sectionHeight) {
            activeSection = 'process';
            processItems.forEach((item, index) => {
                const speed = 1 + index * 0.1;
                const yPos = (scrolled - sectionTop) * speed * 0.1;
                item.style.transform = `translateY(${yPos}px)`;
            });
        } else {
            activeSection = null;
        }
    });

    // Add interactive hover effects
    processItems.forEach((item, index) => {
        const content = item.querySelector('.process-content');
        
        // Create progress bar
        const progress = document.createElement('div');
        progress.className = 'process-progress';
        content.appendChild(progress);
        
        // Mouse move effect
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const angleX = (y - centerY) / 30;
            const angleY = (centerX - x) / 30;
            
            content.style.transform = 
                `perspective(1000px) 
                rotateX(${angleX}deg) 
                rotateY(${angleY}deg) 
                translateZ(30px)`;
        });
        
        // Reset on mouse leave
        item.addEventListener('mouseleave', () => {
            content.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
        
        // Click effect
        item.addEventListener('click', () => {
            item.style.transform = 'scale(0.95)';
            setTimeout(() => {
                item.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

function initPortfolioAnimations() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    // Filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            // Filter items with animation
            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || filter === category) {
                    gsap.to(item, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.5,
                        clearProps: 'all'
                    });
                    item.classList.remove('hidden');
                } else {
                    gsap.to(item, {
                        opacity: 0,
                        scale: 0.8,
                        duration: 0.5,
                        onComplete: () => item.classList.add('hidden')
                    });
                }
            });
        });
    });
    
    // Mouse move effect on portfolio items
    portfolioItems.forEach(item => {
        const content = item.querySelector('.portfolio-content');
        
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (x - centerX) / 20;
            
            gsap.to(content, {
                rotateX: -rotateX,
                rotateY: rotateY,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
        
        item.addEventListener('mouseleave', () => {
            gsap.to(content, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    });
}

function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    
    // Animate sections as they come into view
    gsap.utils.toArray('.section').forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: 100,
            duration: 1,
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                end: "top 50%",
                scrub: 1,
            }
        });
    });

    // Parallax effect for cards
    gsap.utils.toArray('.feature-card').forEach(card => {
        gsap.to(card, {
            y: -50,
            scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });

    initProcessAnimations();
    initEnhancedProcessAnimations();
    initPortfolioAnimations();


    // Animate sections as they come into view
    gsap.utils.toArray('.section').forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: 100,
            duration: 1,
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                end: "top 50%",
                scrub: 1,
            }
        });
    });
}




document.addEventListener('DOMContentLoaded', initScrollAnimations);