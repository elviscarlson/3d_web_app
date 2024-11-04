// static/js/animations/three/cityScene.js

let cityScene, cityCamera, cityRenderer;
let buildings = [];
let cityParticles, backgroundParticles;
let lights = [];
let time = 0;
let dayNightCycle = 0;
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
let materials;
const activeBursts = [];

function initMaterials() {
    materials = {
        building: {
            glass: new THREE.MeshPhysicalMaterial({
                color: 0x222222,
                metalness: 0.9,
                roughness: 0.1,
                transparent: true,
                opacity: 0.95,
                reflectivity: 1
            }),
            solid: new THREE.MeshPhysicalMaterial({
                color: 0x333333,
                metalness: 0.4,
                roughness: 0.5,
            }),
            window: new THREE.MeshPhongMaterial({
                color: 0xffffcc,
                emissive: 0xffffcc,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.9
            })
        },
        ground: new THREE.MeshPhysicalMaterial({
            color: 0x111111,
            metalness: 0.2,
            roughness: 0.8
        }),
        particles: {
            data: new THREE.PointsMaterial({
                color: 0x00ffff,
                size: 0.15,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            }),
            ambient: new THREE.PointsMaterial({
                color: 0x0066ff,
                size: 0.1,
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        }
    };
}

function initCityScene() {
    console.log('Initializing city scene...');
    
    const container = document.getElementById('city-container');
    if (!container) {
        console.error('City container not found!');
        return;
    }

    // Initialize materials first
    initMaterials();

    // Scene setup
    cityScene = new THREE.Scene();
    cityScene.fog = new THREE.FogExp2(0x001133, 0.0015);
    cityScene.background = new THREE.Color(0x001133);

    // Camera setup
    cityCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cityCamera.position.set(15, 15, 15);
    cityCamera.lookAt(0, 0, 0);

    // Renderer setup
    cityRenderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false 
    });
    cityRenderer.setSize(window.innerWidth, window.innerHeight);
    cityRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    cityRenderer.shadowMap.enabled = true;
    cityRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(cityRenderer.domElement);

    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
    const ground = new THREE.Mesh(groundGeometry, materials.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    cityScene.add(ground);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x001133, 0.2);
    cityScene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x0066ff, 0.5);
    moonLight.position.set(50, 30, 50);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.camera.far = 100;
    cityScene.add(moonLight);

    const sunLight = new THREE.DirectionalLight(0xffffcc, 1);
    sunLight.position.set(-50, 30, -50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.far = 100;
    cityScene.add(sunLight);

    // Generate scene elements
    generateCity();
    createBackgroundParticles();
    createCityParticles();

    // Add mouse movement
    document.addEventListener('mousemove', onMouseMove);

    // Start animation
    animate();
}

function generateCity() {
    for(let x = -25; x <= 25; x += 5) {
        for(let z = -25; z <= 25; z += 5) {
            const height = Math.random() * 20 + 10;
            const width = 2 + Math.random() * 2;
            const depth = 2 + Math.random() * 2;
            
            // Create building geometry with more detail
            const geometry = new THREE.BoxGeometry(width, height, depth);
            const edges = new THREE.EdgesGeometry(geometry);
            const building = new THREE.Mesh(geometry, materials.building.glass);
            const frame = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x444444 }));
            
            building.position.set(x, height/2, z);
            building.castShadow = true;
            building.receiveShadow = true;
            building.add(frame);
            
            // Add more detailed windows
            const rows = Math.floor(height / 2);
            const cols = 4;
            const windowSize = 0.3;
            const windowSpacing = 0.5;
            
            for(let row = 0; row < rows; row++) {
                for(let col = 0; col < cols; col++) {
                    const windowGeom = new THREE.PlaneGeometry(windowSize, windowSize);
                    const window = new THREE.Mesh(windowGeom, materials.building.window.clone());
                    
                    // Position windows evenly around building
                    const angle = (col / cols) * Math.PI * 2;
                    const radius = Math.max(width, depth) / 2 + 0.01;
                    
                    window.position.x = Math.sin(angle) * radius;
                    window.position.z = Math.cos(angle) * radius;
                    window.position.y = row * windowSpacing - height/2 + 1;
                    window.rotation.y = angle;
                    
                    building.add(window);
                    lights.push(window);
                }
            }
            
            buildings.push({
                mesh: building,
                targetHeight: height,
                currentHeight: 0
            });
            cityScene.add(building);
        }
    }
}

function createBackgroundParticles() {
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for(let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 100;
        positions[i + 1] = Math.random() * 50;
        positions[i + 2] = (Math.random() - 0.5) * 100;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0x0096ff,
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    backgroundParticles = new THREE.Points(geometry, material);
    cityScene.add(backgroundParticles);
}

function createCityParticles() {
    const particleCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for(let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = Math.random() * 100 - 50;
        positions[i + 1] = Math.random() * 50;
        positions[i + 2] = Math.random() * 100 - 50;
        
        // Add color variation
        colors[i] = 0.5 + Math.random() * 0.5;     // R
        colors[i + 1] = 0.8 + Math.random() * 0.2; // G
        colors[i + 2] = 1;                         // B
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = materials.particles.data.clone();
    material.vertexColors = true;
    
    cityParticles = new THREE.Points(geometry, material);
    cityScene.add(cityParticles);
}

function createParticleBurst(x, y, z) {
    const burstCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(burstCount * 3);
    const velocities = [];

    for(let i = 0; i < burstCount * 3; i += 3) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.1 + Math.random() * 0.2;
        velocities.push({
            x: Math.cos(angle) * speed,
            y: Math.random() * speed,
            z: Math.sin(angle) * speed
        });
        
        positions[i] = x;
        positions[i + 1] = y;
        positions[i + 2] = z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0x00ff96,
        size: 0.1,
        transparent: true,
        opacity: 1
    });

    const burst = new THREE.Points(geometry, material);
    cityScene.add(burst);

    return { burst, velocities };
}

function onMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.0002;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.0002;

    // Create random bursts
    if(Math.random() < 0.05) {
        const vector = new THREE.Vector3(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1,
            0.5
        );
        vector.unproject(cityCamera);
        const burst = createParticleBurst(vector.x * 10, vector.y * 10, vector.z * 10);
        activeBursts.push(burst);
    }
}

function updateParticles() {
    // Update background particles
    if(backgroundParticles) {
        backgroundParticles.rotation.y += 0.0001;
        const positions = backgroundParticles.geometry.attributes.position.array;
        
        for(let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += 0.01;
            if(positions[i + 1] > 50) positions[i + 1] = 0;
        }
        
        backgroundParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Update city particles
    if(cityParticles) {
        cityParticles.rotation.y += 0.0002;
        const positions = cityParticles.geometry.attributes.position.array;
        
        for(let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += 0.02;
            if(positions[i + 1] > 50) positions[i + 1] = 0;
        }
        
        cityParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Update burst particles
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
            cityScene.remove(burst);
            activeBursts.splice(i, 1);
        }
    }
}

function updateDayNightCycle() {
    dayNightCycle += 0.001;
    const daylight = Math.sin(dayNightCycle) * 0.5 + 0.5;
    
    const skyColor = new THREE.Color(0x001133).lerp(new THREE.Color(0x0066ff), daylight);
    cityScene.background = skyColor;
    cityScene.fog.color = skyColor;
    
    lights.forEach(light => {
        light.material.opacity = Math.max(0.2, 1 - daylight * 1.5);
        light.material.emissiveIntensity = Math.max(0.2, 1 - daylight);
    });
    
    buildings.forEach(building => {
        building.mesh.material.opacity = 0.8 + Math.sin(dayNightCycle) * 0.1;
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    time += 0.05;
    targetX += (mouseX - targetX) * 0.02;
    targetY += (mouseY - targetY) * 0.02;
    
    // Animate buildings
    buildings.forEach((building, index) => {
        if(building.mesh.scale.y < 1) {
            building.mesh.scale.y += 0.01;
            building.mesh.position.y = building.targetHeight * building.mesh.scale.y / 2;
        }
        
        building.mesh.position.y += Math.sin(time * 0.5 + index) * 0.0005;
    });
    
    updateParticles();
    updateDayNightCycle();
    
    cityRenderer.render(cityScene, cityCamera);
}

function onWindowResize() {
    cityCamera.aspect = window.innerWidth / window.innerHeight;
    cityCamera.updateProjectionMatrix();
    cityRenderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

function setAerialView() {
    gsap.to(cityCamera.position, {
        x: 15,
        y: 30,
        z: 15,
        duration: 2,
        ease: 'power2.inOut'
    });
}

function setStreetView() {
    gsap.to(cityCamera.position, {
        x: 5,
        y: 2,
        z: 5,
        duration: 2,
        ease: 'power2.inOut'
    });
}

function circleCamera() {
    gsap.to(cityCamera.position, {
        x: Math.sin(time) * 20,
        z: Math.cos(time) * 20,
        duration: 10,
        ease: 'none',
        repeat: -1
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initCityScene();
    
    document.querySelectorAll('.control-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            if(index === 0) setAerialView();
            if(index === 1) setStreetView();
            if(index === 2) circleCamera();
        });
    });
});