class WorldManager {
    constructor(scene) {
        this.scene = scene;
        this.gridSize = 16;
        this.renderRadius = 3;
        this.activeLamps = new Map();

        this.exitPosition = new THREE.Vector3(
            (Math.floor(Math.random() * 6) - 3) * this.gridSize,
            0,
            -100
        );

        this.floor = this.createInfiniteFloor();
        this.scene.add(this.floor);

        this.exitDoor = this.createExitDoor(this.exitPosition);
        this.scene.add(this.exitDoor);
        
        this.escaped = false;
    }

    createInfiniteFloor() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#0a0d11';
        ctx.fillRect(0, 0, 256, 256);

        for (let i = 0; i < 8000; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const shade = Math.floor(Math.random() * 15);
            ctx.fillStyle = `rgb(${10 + shade}, ${12 + shade}, ${16 + shade})`;
            ctx.fillRect(x, y, 2, 2);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(200, 200);

        const groundGeo = new THREE.PlaneGeometry(2000, 2000);
        const groundMat = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.95,
            metalness: 0.05
        });

        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        return ground;
    }

    createExitDoor(position) {
        const group = new THREE.Group();
        group.position.copy(position);

        const frameGeo = new THREE.BoxGeometry(2.2, 4.2, 0.3);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.y = 2.1;
        group.add(frame);

        const doorGeo = new THREE.PlaneGeometry(1.8, 3.8);
        const doorMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, 2.1, 0.01);
        group.add(door);

        const light = new THREE.PointLight(0xffffff, 3, 20);
        light.position.set(0, 2.1, 1);
        group.add(light);

        return group;
    }

    update(playerPos) {
        if (this.escaped) return;

        const currentChunkX = Math.floor((playerPos.x + this.gridSize / 2) / this.gridSize);
        const currentChunkZ = Math.floor((playerPos.z + this.gridSize / 2) / this.gridSize);

        const requiredKeys = new Set();
        const lampDistances = [];

        for (let x = -this.renderRadius; x <= this.renderRadius; x++) {
            for (let z = -this.renderRadius; z <= this.renderRadius; z++) {
                const chunkX = currentChunkX + x;
                const chunkZ = currentChunkZ + z;
                const key = `${chunkX},${chunkZ}`;
                requiredKeys.add(key);

                let lamp = this.activeLamps.get(key);
                if (!lamp) {
                    const worldX = chunkX * this.gridSize;
                    const worldZ = chunkZ * this.gridSize;
                    lamp = createStreetlamp(worldX, worldZ);
                    this.scene.add(lamp);
                    this.activeLamps.set(key, lamp);
                }

                const distSq = lamp.position.distanceToSquared(playerPos);
                lampDistances.push({ lamp, distSq });
            }
        }

        for (const [key, lamp] of this.activeLamps.entries()) {
            if (!requiredKeys.has(key)) {
                this.scene.remove(lamp);
                this.activeLamps.delete(key);
            }
        }

        lampDistances.sort((a, b) => a.distSq - b.distSq);

        for (let i = 0; i < lampDistances.length; i++) {
            const { lamp, distSq } = lampDistances[i];
            const light = lamp.userData.light;

            if (i < 4 && distSq < 1600) {
                light.intensity = 4.5;
                light.castShadow = (i < 2);
            } else if (i < 10 && distSq < 3600) {
                light.intensity = 2.0;
                light.castShadow = false;
            } else {
                light.intensity = 0;
                light.castShadow = false;
            }
        }

        const distToExit = playerPos.distanceTo(this.exitDoor.position);
        if (distToExit < 2.5) {
            this.escaped = true;
            document.getElementById('level-clear').style.display = 'block';
        }
    }
}
