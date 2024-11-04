// static/js/animations/three/scene.js
let scene, camera, renderer, particles;
const particlesCount = 1000;

function initThreeJS() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
    });
    
    // Configure renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('content').appendChild(renderer.domElement);
    
    // Create particle geometry
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    
    // Create random particles positions
    for(let i = 0; i < particlesCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 10;      // x
        positions[i + 1] = (Math.random() - 0.5) * 10;  // y
        positions[i + 2] = (Math.random() - 0.5) * 10;  // z
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Create particle material
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0x0096ff,
        size: 0.02,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    // Create particle system
    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    // Position camera
    camera.position.z = 5;
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Start animation
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

let activeSection = null;

// Add this function to create particle bursts
function createParticleBurst(x, y) {
    const burstCount = 20;
    const burstGeometry = new THREE.BufferGeometry();
    const burstPositions = new Float32Array(burstCount * 3);
    const velocities = [];

    for(let i = 0; i < burstCount * 3; i += 3) {
        const angle = (Math.random() * Math.PI * 2);
        const speed = 0.1 + Math.random() * 0.2;
        velocities.push({
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
            z: (Math.random() - 0.5) * 0.1
        });
        
        burstPositions[i] = x;
        burstPositions[i + 1] = y;
        burstPositions[i + 2] = 0;
    }

    burstGeometry.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3));
    
    const burstMaterial = new THREE.PointsMaterial({
        color: 0x00ff96,
        size: 0.05,
        transparent: true,
        opacity: 1
    });

    const burst = new THREE.Points(burstGeometry, burstMaterial);
    scene.add(burst);

    return { burst, velocities };
}

// Track active bursts
const activeBursts = [];


let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

// Update mouse position with lerping for smooth movement
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.0002; // Reduced from 0.001
    mouseY = (event.clientY - window.innerHeight / 2) * 0.0002; // Reduced from 0.001
});

document.addEventListener('mousemove', (event) => {
    if (activeSection === 'process') {
        const rect = renderer.domElement.getBoundingClientRect(); // Changed from getBoundRect
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        if (Math.random() < 0.1) {
            const burst = createParticleBurst(x, y);
            activeBursts.push(burst);
        }
    }
});

function animate() {
    requestAnimationFrame(animate);
    
    // Smooth mouse movement with reduced sensitivity
    targetX += (mouseX - targetX) * 0.02; // Reduced from 0.05
    targetY += (mouseY - targetY) * 0.02; // Reduced from 0.05
    
    // Rotate particles based on mouse position with reduced multiplier
    particles.rotation.x += targetY * 0.1; // Reduced from 0.3
    particles.rotation.y += targetX * 0.1; // Reduced from 0.3
    
    // Slower continuous rotation
    particles.rotation.z += 0.0002; // Reduced from 0.001
    
    // Update particles positions for gentler wave effect
    const positions = particles.geometry.attributes.position.array;
    const time = Date.now() * 0.00002; // Reduced from 0.00005
    
    for(let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        
        // Gentler wave effect
        positions[i + 1] = y + Math.sin(time * 2 + x) * 0.05; // Reduced multipliers
    }
    particles.geometry.attributes.position.needsUpdate = true;

    for(let i = activeBursts.length - 1; i >= 0; i--) {
        const { burst, velocities } = activeBursts[i];
        const positions = burst.geometry.attributes.position.array;
        
        for(let j = 0; j < positions.length; j += 3) {
            positions[j] += velocities[j/3].x;
            positions[j + 1] += velocities[j/3].y;
            positions[j + 2] += velocities[j/3].z;
        }
        
        burst.geometry.attributes.position.needsUpdate = true;
        burst.material.opacity -= 0.02;
        
        if(burst.material.opacity <= 0) {
            scene.remove(burst);
            activeBursts.splice(i, 1);
        }
    }
    
    
    renderer.render(scene, camera);
}

// Initialize Three.js when DOM is loaded
document.addEventListener('DOMContentLoaded', initThreeJS);