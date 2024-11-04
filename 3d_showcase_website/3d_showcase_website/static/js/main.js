// static/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('Main JS loaded');
});

// Debug helper to check if Three.js is loaded
window.addEventListener('load', () => {
    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded!');
    } else {
        console.log('Three.js loaded successfully');
    }
});


function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function initStatsAnimation() {
    const statsSection = document.querySelector('.stats-section');
    if (!statsSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate stat numbers
                const statNumbers = document.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const targetValue = parseInt(stat.getAttribute('data-value'));
                    animateValue(stat, 0, targetValue, 2000);
                });

                // Show stat items with fade-in
                const statItems = document.querySelectorAll('.stat-item');
                statItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('visible');
                    }, index * 200);
                });

                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    observer.observe(statsSection);
}

// Initialize all animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing animations...');
    initStatsAnimation();
});

// Add hover effect to cards if using mouse
if (window.matchMedia('(hover: hover)').matches) {
    const cards = document.querySelectorAll('.showcase-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.05)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1)';
        });
    });
}