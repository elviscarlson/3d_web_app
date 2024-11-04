// static/js/animations/three/cosmicNetwork.js

let scene, camera, renderer;
let nodes = [];
let connections = [];
let particles;
let raycaster;
let mouse;
let time = 0;
let activeNode = null;

class Node {
    constructor(position) {
        const geometry = new THREE.SphereGeometry(0.3, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            emissive: 0x0088ff,
            transparent: true,
            opacity: 0.8
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.connections = [];
        this.pulses = [];
        this.baseColor = new THREE.Color(0x00ffff);
        this.targetColor = new THREE.Color(0x00ffff);
        this.originalScale = 1;
        
        // Add glow
        const glowGeometry = new THREE.SphereGeometry(0.4, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(0x0088ff) },
                viewVector: { value: camera.position }
            },
            vertexShader: `
                uniform vec3 viewVector;
                varying float intensity;
                void main() {
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    vec3 actual_normal = normalize(normalMatrix * normal);
                    vec3 actual_view = normalize(viewVector - vec3(modelViewMatrix * vec4(position, 1.0)));
                    intensity = pow(0.6 - dot(actual_normal, actual_view), 2.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                varying float intensity;
                void main() {
                    gl_FragColor = vec4(color, 1.0) * intensity;
                }
            `,
            side: THREE.BackSide,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(this.glow);
    }

    update() {
        // Pulse effect
        this.mesh.scale.x = this.originalScale + Math.sin(time * 2) * 0.1;
        this.mesh.scale.y = this.originalScale + Math.sin(time * 2) * 0.1;
        this.mesh.scale.z = this.originalScale + Math.sin(time * 2) * 0.1;
        
        // Color transition
        this.mesh.material.color.lerp(this.targetColor, 0.05);
        this.mesh.material.emissive.lerp(this.targetColor, 0.05);
        this.glow.material.uniforms.color.value.lerp(this.targetColor, 0.05);
    }

    activate() {
        this.targetColor.set(0xff00ff);
        this.originalScale = 1.5;
        this.createPulse();
    }

    deactivate() {
        this.targetColor.set(this.baseColor);
        this.originalScale = 1;
    }

    createPulse() {
        this.connections.forEach(connection => {
            const pulse = new Pulse(this, connection.end);
            this.pulses.push(pulse);
            scene.add(pulse.mesh);
        });
    }
}

class Connection {
    constructor(start, end) {
        const points = [start.mesh.position, end.mesh.position];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        this.material = new THREE.LineBasicMaterial({
            color: 0x0088ff,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        
        this.mesh = new THREE.Line(geometry, this.material);
        this.start = start;
        this.end = end;
    }

    update() {
        // Update line positions if nodes move
        const positions = this.mesh.geometry.attributes.position.array;
        positions[0] = this.start.mesh.position.x;
        positions[1] = this.start.mesh.position.y;
        positions[2] = this.start.mesh.position.z;
        positions[3] = this.end.mesh.position.x;
        positions[4] = this.end.mesh.position.y;
        positions[5] = this.end.mesh.position.z;
        this.mesh.geometry.attributes.position.needsUpdate = true;
    }
}

class Pulse {
    constructor(start, end) {
        this.start = start.mesh.position;
        this.end = end.mesh.position;
        this.progress = 0;
        
        const geometry = new THREE.SphereGeometry(0.1, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
    }

    update() {
        this.progress += 0.02;
        if (this.progress >= 1) {
            scene.remove(this.mesh);
            return false;
        }
        
        // Calculate position along the path
        this.mesh.position.lerpVectors(this.start, this.end, this.progress);
        
        // Fade out near the end
        if (this.progress > 0.8) {
            this.mesh.material.opacity = (1 - this.progress) * 5;
        }
        
        return true;
    }
}

function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('content').appendChild(renderer.domElement);
    
    // Setup scene
    scene.fog = new THREE.FogExp2(0x000000, 0.02);
    camera.position.z = 30;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x000066, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x0088ff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Initialize raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Create nodes
    createNetwork();
    createBackgroundParticles();
    
    // Event listeners
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onMouseMove, false);
    
    animate();
}

function createNetwork() {
    // Create nodes in a spherical arrangement
    for (let i = 0; i < 50; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = 15 + Math.random() * 5;
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        const node = new Node(new THREE.Vector3(x, y, z));
        nodes.push(node);
        scene.add(node.mesh);
    }
    
    // Create connections
    nodes.forEach(node => {
        const nearestNodes = findNearestNodes(node, 3);
        nearestNodes.forEach(nearNode => {
            if (!isConnected(node, nearNode)) {
                const connection = new Connection(node, nearNode);
                connections.push(connection);
                scene.add(connection.mesh);
                node.connections.push(connection);
            }
        });
    });
}

function createBackgroundParticles() {
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 100;
        positions[i + 1] = (Math.random() - 0.5) * 100;
        positions[i + 2] = (Math.random() - 0.5) * 100;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0x0088ff,
        size: 0.2,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });
    
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function findNearestNodes(node, count) {
    return nodes
        .filter(n => n !== node)
        .sort((a, b) => {
            const distA = node.mesh.position.distanceTo(a.mesh.position);
            const distB = node.mesh.position.distanceTo(b.mesh.position);
            return distA - distB;
        })
        .slice(0, count);
}

function isConnected(node1, node2) {
    return connections.some(conn => 
        (conn.start === node1 && conn.end === node2) ||
        (conn.start === node2 && conn.end === node1)
    );
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodes.map(n => n.mesh));
    
    if (intersects.length > 0) {
        const newActiveNode = nodes.find(n => n.mesh === intersects[0].object);
        if (activeNode !== newActiveNode) {
            if (activeNode) activeNode.deactivate();
            activeNode = newActiveNode;
            activeNode.activate();
        }
    } else if (activeNode) {
        activeNode.deactivate();
        activeNode = null;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    time += 0.01;
    
    // Update nodes
    nodes.forEach(node => {
        node.update();
        
        // Update pulses
        node.pulses = node.pulses.filter(pulse => pulse.update());
    });
    
    // Update connections
    connections.forEach(connection => connection.update());
    
    // Rotate camera slowly
    camera.position.x = Math.sin(time * 0.1) * 30;
    camera.position.z = Math.cos(time * 0.1) * 30;
    camera.lookAt(0, 0, 0);
    
    // Update background particles
    if (particles) {
        particles.rotation.y += 0.0003;
        particles.rotation.x += 0.0001;
    }
    
    renderer.render(scene, camera);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initScene);