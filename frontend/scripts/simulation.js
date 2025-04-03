// DOM Elements
const vgsSlider = document.getElementById('vgs-slider');
const vdsSlider = document.getElementById('vds-slider');
const vgsValue = document.getElementById('vgs-value');
const vdsValue = document.getElementById('vds-value');
const currentValue = document.getElementById('current-value');
const powerValue = document.getElementById('power-value');
const tempValue = document.getElementById('temp-value');
const runButton = document.getElementById('run-simulation');
const simulationCanvas = document.getElementById('simulation-canvas');

// Event Listeners
vgsSlider.addEventListener('input', updateSliderValue);
vdsSlider.addEventListener('input', updateSliderValue);
runButton.addEventListener('click', runSimulation);

// Initialize Three.js for circuit visualization
let scene, camera, renderer;
initThreeJS();

function updateSliderValue(e) {
    const target = e.target;
    const value = parseFloat(target.value).toFixed(1);
    
    if (target.id === 'vgs-slider') {
        vgsValue.textContent = `${value}V`;
    } else {
        vdsValue.textContent = `${value}V`;
    }
}

async function runSimulation() {
    runButton.disabled = true;
    runButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Running...';

    const vgs = vgsSlider.value;
    const vds = vdsSlider.value;

    try {
        const response = await fetch(`http://localhost:8000/simulate/transistor?vgs=${vgs}&vds=${vds}`);
        const data = await response.json();

        // Update UI with results
        currentValue.textContent = (data.current * 1000).toFixed(2);
        powerValue.textContent = (data.power * 1000).toFixed(2);
        tempValue.textContent = data.temperature.toFixed(0);

        // Update visualization
        updateCircuitVisualization(data);
    } catch (error) {
        console.error('Simulation error:', error);
        alert('Failed to run simulation. Please check console for details.');
    } finally {
        runButton.disabled = false;
        runButton.innerHTML = '<i class="fas fa-play mr-2"></i>Run Simulation';
    }
}

function initThreeJS() {
    // Basic Three.js setup for circuit visualization
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, simulationCanvas.clientWidth / simulationCanvas.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(simulationCanvas.clientWidth, simulationCanvas.clientHeight);
    renderer.setClearColor(0xf0f0f0);
    simulationCanvas.appendChild(renderer.domElement);
    
    // Basic lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Camera position
    camera.position.z = 5;
    
    // Initial render
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function updateCircuitVisualization(data) {
    // Clear previous circuit
    while(scene.children.length > 2) { // Keep lights
        scene.remove(scene.children[2]);
    }

    // Create new circuit based on simulation data
    const geometry = new THREE.BoxGeometry(1, 0.1, 0.1);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x3498db,
        emissive: 0x000000,
        emissiveIntensity: data.current * 10,
        specular: 0x111111,
        shininess: 30
    });
    
    const transistor = new THREE.Mesh(geometry, material);
    scene.add(transistor);
    
    // Add connections
    const connectionGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
    const connectionMaterial = new THREE.MeshBasicMaterial({ color: 0x2c3e50 });
    
    const drain = new THREE.Mesh(connectionGeometry, connectionMaterial);
    drain.position.set(0, 1, 0);
    drain.rotation.x = Math.PI / 2;
    scene.add(drain);
    
    const source = new THREE.Mesh(connectionGeometry, connectionMaterial);
    source.position.set(0, -1, 0);
    source.rotation.x = Math.PI / 2;
    scene.add(source);
}