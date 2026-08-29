function initCrosshair() {
    const hud = document.getElementById('hud');
    const crosshair = document.createElement('div');
    
    crosshair.style.position = 'absolute';
    crosshair.style.top = '50%';
    crosshair.style.left = '50%';
    crosshair.style.width = '4px';
    crosshair.style.height = '4px';
    crosshair.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
    crosshair.style.borderRadius = '50%';
    crosshair.style.transform = 'translate(-50%, -50%)';
    
    hud.appendChild(crosshair);
}
