class Player {
    constructor(camera, domElement, scene) {
        this.camera = camera;
        this.scene = scene;

        this.cameraPivot = new THREE.Group();
        this.scene.add(this.cameraPivot);
        this.cameraPivot.add(this.camera);

        this.controls = new THREE.PointerLockControls(this.cameraPivot, domElement);
        this.clickPrompt = document.getElementById('click-prompt');

        this.walkSpeed = 3.5;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.keys = { forward: false, backward: false, left: false, right: false, zoomIn: false, zoomOut: false };

        this.headBobTimer = 0;
        this.baseFov = 70;
        this.zoomFactor = 1.0;
        this.targetZoom = 1.0;

        this.shadowCaster = this.createShadowCaster();
        this.scene.add(this.shadowCaster);

        this.initControls(domElement);
    }

    createShadowCaster() {
        const geo = new THREE.CylinderGeometry(0.35, 0.35, 1.7, 8);
        const mat = new THREE.MeshBasicMaterial({ visible: false });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        return mesh;
    }

    initControls(domElement) {
        domElement.addEventListener('click', () => {
            if (!this.controls.isLocked) this.controls.lock();
        });

        this.controls.addEventListener('lock', () => { this.clickPrompt.style.display = 'none'; });
        this.controls.addEventListener('unlock', () => { this.clickPrompt.style.display = 'block'; });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyW' || e.code === 'ArrowUp') this.keys.forward = true;
            if (e.code === 'KeyS' || e.code === 'ArrowDown') this.keys.backward = true;
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = true;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = true;
            if (e.code === 'KeyE') this.keys.zoomIn = true;
            if (e.code === 'KeyQ') this.keys.zoomOut = true;

            if (e.code === 'KeyC' && window.vhs) {
                window.vhs.toggle();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'KeyW' || e.code === 'ArrowUp') this.keys.forward = false;
            if (e.code === 'KeyS' || e.code === 'ArrowDown') this.keys.backward = false;
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = false;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = false;
            if (e.code === 'KeyE') this.keys.zoomIn = false;
            if (e.code === 'KeyQ') this.keys.zoomOut = false;
        });
    }

    update(delta) {
        if (!this.controls.isLocked) return;

        const isVhsActive = window.vhs && window.vhs.enabled;

        this.direction.z = Number(this.keys.forward) - Number(this.keys.backward);
        this.direction.x = Number(this.keys.right) - Number(this.keys.left);
        this.direction.normalize();

        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;

        const isMoving = this.keys.forward || this.keys.backward || this.keys.left || this.keys.right;

        if (this.keys.forward || this.keys.backward) this.velocity.z -= this.direction.z * this.walkSpeed * 10.0 * delta;
        if (this.keys.left || this.keys.right) this.velocity.x -= this.direction.x * this.walkSpeed * 10.0 * delta;

        this.controls.moveRight(-this.velocity.x * delta);
        this.controls.moveForward(-this.velocity.z * delta);

        if (isVhsActive) {
            if (this.keys.zoomIn) {
                this.targetZoom = Math.min(this.targetZoom + delta * 2.5, 5.0);
            }
            if (this.keys.zoomOut) {
                this.targetZoom = Math.max(this.targetZoom - delta * 2.5, 0.75);
            }
        } else {
            this.targetZoom = 1.0;
        }

        this.zoomFactor = THREE.MathUtils.lerp(this.zoomFactor, this.targetZoom, delta * 6);
        this.camera.fov = this.baseFov / this.zoomFactor;
        this.camera.updateProjectionMatrix();

        if (window.vhs) window.vhs.updateZoomDisplay(this.zoomFactor);

        if (isMoving) {
            this.headBobTimer += delta * (isVhsActive ? 7.5 : 9.0);

            const bobIntensity = isVhsActive ? 0.06 : 0.03;
            const targetY = Math.sin(this.headBobTimer) * bobIntensity;

            const strafeTilt = (Number(this.keys.left) - Number(this.keys.right)) * (isVhsActive ? 0.03 : 0.015);
            const walkTilt = Math.cos(this.headBobTimer * 0.5) * (isVhsActive ? 0.012 : 0.005);

            this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetY, delta * 10);
            this.camera.rotation.z = THREE.MathUtils.lerp(this.camera.rotation.z, strafeTilt + walkTilt, delta * 10);
        } else {
            this.headBobTimer = 0;
            this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 0, delta * 6);
            this.camera.rotation.z = THREE.MathUtils.lerp(this.camera.rotation.z, 0, delta * 6);
        }

        this.shadowCaster.position.copy(this.cameraPivot.position);
        this.shadowCaster.position.y = 0.85;
    }
}
