initCrosshair();
window.vhs = new VHSOverlay();
window.vhs.setLevelDate("LEVEL 0: SAFE ZONE");

const scene = new THREE.Scene();
const bgColor = 0x020305;
scene.background = new THREE.Color(bgColor);
scene.fog = new THREE.FogExp2(bgColor, 0.045);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x080c14, 0.15);
scene.add(ambientLight);

const world = new WorldManager(scene);
const player = new Player(camera, document.body, scene);
player.cameraPivot.position.set(0, 1.7, 4);

let prevTime = performance.now();
function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000;
    prevTime = time;

    player.update(delta);
    world.update(player.cameraPivot.position);
    window.vhs.render(time);

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
