// static/js/components/Loader.js
function initLoader() {
    console.log('Loader initialized'); // Debug log
    const loader = document.getElementById('loader');
    
    // Add loading animation
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-spinner"></div>
            <div class="loader-text">Loading...</div>
        </div>
    `;
    
    window.addEventListener('load', () => {
        console.log('Window loaded'); // Debug log
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 1000);
    });
}

document.addEventListener('DOMContentLoaded', initLoader);