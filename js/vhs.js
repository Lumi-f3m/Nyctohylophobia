class VHSOverlay {
    constructor() {
        this.canvas = document.getElementById('vhs-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.ui = document.getElementById('vhs-ui');
        this.timecodeEl = document.getElementById('vhs-timecode');
        this.dateEl = document.getElementById('vhs-date');
        this.clockEl = document.getElementById('vhs-clock');
        this.zoomValEl = document.getElementById('vhs-zoom-val');

        this.enabled = true;
        this.glitchDuration = 0;
        this.glitchY = 0;

        this.currentLevelDate = "OCT.14 1998";
        this.startTime = Date.now();

        this.noisePattern = this.generateNoisePattern();
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    setLevelDate(dateString) {
        this.currentLevelDate = dateString;
        if (this.dateEl) this.dateEl.innerText = this.currentLevelDate;
    }

    updateZoomDisplay(zoomFactor) {
        if (this.zoomValEl) {
            this.zoomValEl.innerText = `OPTICAL ZOOM ${zoomFactor.toFixed(1)}x`;
        }
    }

    generateNoisePattern() {
        const pCanvas = document.createElement('canvas');
        pCanvas.width = 128;
        pCanvas.height = 128;
        const pCtx = pCanvas.getContext('2d');
        const imgData = pCtx.createImageData(128, 128);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
            const grain = Math.random() * 255;
            data[i] = grain;
            data[i + 1] = grain;
            data[i + 2] = grain;
            data[i + 3] = 30;
        }

        pCtx.putImageData(imgData, 0, 0);
        return this.ctx.createPattern(pCanvas, 'repeat');
    }

    resize() {
        this.canvas.width = Math.floor(window.innerWidth / 2);
        this.canvas.height = Math.floor(window.innerHeight / 2);
    }

    toggle() {
        this.enabled = !this.enabled;
        this.canvas.style.display = this.enabled ? 'block' : 'none';
        this.ui.style.display = this.enabled ? 'flex' : 'none';
    }

    render(time) {
        if (!this.enabled) return;

        const w = this.canvas.width;
        const h = this.canvas.height;

        this.ctx.clearRect(0, 0, w, h);

        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const hrs = String(Math.floor(elapsed / 3600)).padStart(2, '0');
        const mins = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
        const secs = String(elapsed % 60).padStart(2, '0');
        const frames = String(Math.floor((time * 0.03) % 30)).padStart(2, '0');

        if (this.timecodeEl) this.timecodeEl.innerText = `TC ${hrs}:${mins}:${secs}:${frames}`;

        const grad = this.ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.75);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.8)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, w, h);

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let y = 0; y < h; y += 2) {
            this.ctx.fillRect(0, y, w, 1);
        }

        this.ctx.save();
        this.ctx.translate((Math.random() - 0.5) * 64, (Math.random() - 0.5) * 64);
        this.ctx.fillStyle = this.noisePattern;
        this.ctx.fillRect(-64, -64, w + 128, h + 128);
        this.ctx.restore();

        if (Math.random() < 0.02 && this.glitchDuration <= 0) {
            this.glitchDuration = Math.floor(Math.random() * 6) + 2;
            this.glitchY = Math.random() * h;
        }

        if (this.glitchDuration > 0) {
            this.glitchDuration--;
            const barHeight = Math.random() * 20 + 4;

            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            this.ctx.fillRect(0, this.glitchY, w, barHeight);

            this.ctx.fillStyle = 'rgba(255, 0, 80, 0.25)';
            this.ctx.fillRect((Math.random() - 0.5) * 12, this.glitchY, w, 2);
            this.ctx.fillStyle = 'rgba(0, 255, 200, 0.25)';
            this.ctx.fillRect((Math.random() - 0.5) * 12, this.glitchY + 3, w, 2);
        }

        const tapeY = (time * 0.08) % h;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.fillRect(0, tapeY, w, 3);
    }
}
