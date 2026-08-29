function createStreetlamp(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 6, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.8 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 3;
    pole.castShadow = true;
    group.add(pole);

    const armGeo = new THREE.BoxGeometry(0.1, 0.1, 1.2);
    const arm = new THREE.Mesh(armGeo, poleMat);
    arm.position.set(0, 5.8, 0.5);
    group.add(arm);

    const bulbGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfffaed });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(0, 5.7, 1.0);
    group.add(bulb);

    const light = new THREE.SpotLight(0xfff5db, 0, 22, Math.PI / 3, 0.5, 1.5);
    light.position.set(0, 5.6, 1.0);
    light.target.position.set(0, 0, 1.0);
    light.castShadow = false;
    
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 22;

    group.add(light);
    group.add(light.target);

    group.userData = { light: light, bulb: bulb };

    return group;
}
