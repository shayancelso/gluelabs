// Simplified Gloo Video Ad Animation
class GlooVideoAd {
    constructor() {
        this.canvas = document.getElementById('video-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 1920;
        this.height = 1080;
        this.duration = 10000; // 10 seconds in ms
        this.startTime = null;
        this.isPlaying = false;
        this.currentTime = 0;
        
        this.init();
    }
    
    init() {
        // Set canvas size
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Set up controls
        this.setupControls();
        
        // Initial render
        this.draw(0);
    }
    
    setupControls() {
        const playBtn = document.getElementById('play-btn');
        const scrubber = document.getElementById('timeline-scrubber');
        const exportBtn = document.getElementById('export-btn');
        
        playBtn.addEventListener('click', () => {
            if (this.isPlaying) {
                this.pause();
                playBtn.textContent = 'Play Animation';
            } else {
                this.play();
                playBtn.textContent = 'Pause';
            }
        });
        
        scrubber.addEventListener('input', (e) => {
            const time = parseFloat(e.target.value) * 1000; // Convert to ms
            this.currentTime = time;
            this.draw(time);
            document.getElementById('time-display').textContent = (time / 1000).toFixed(1) + 's';
        });
        
        exportBtn.addEventListener('click', () => {
            this.export();
        });
    }
    
    play() {
        this.isPlaying = true;
        this.startTime = performance.now() - this.currentTime;
        this.animate();
    }
    
    pause() {
        this.isPlaying = false;
    }
    
    animate() {
        if (!this.isPlaying) return;
        
        const now = performance.now();
        this.currentTime = now - this.startTime;
        
        if (this.currentTime >= this.duration) {
            // Loop back to start
            this.currentTime = 0;
            this.startTime = now;
        }
        
        this.draw(this.currentTime);
        
        // Update controls
        document.getElementById('timeline-scrubber').value = this.currentTime / 1000;
        document.getElementById('time-display').textContent = (this.currentTime / 1000).toFixed(1) + 's';
        
        requestAnimationFrame(() => this.animate());
    }
    
    draw(time) {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0b';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Calculate which scene we're in
        const progress = time / this.duration;
        
        if (time < 2000) {
            // Scene 1: Hook (0-2s)
            this.drawScene1(time / 2000);
        } else if (time < 5000) {
            // Scene 2: Solution (2-5s)
            this.drawScene2((time - 2000) / 3000);
        } else if (time < 8000) {
            // Scene 3: Benefits (5-8s)
            this.drawScene3((time - 5000) / 3000);
        } else {
            // Scene 4: CTA (8-10s)
            this.drawScene4((time - 8000) / 2000);
        }
        
        // Draw floating particles throughout
        this.drawParticles(progress);
    }
    
    drawScene1(progress) {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Fade in
        ctx.globalAlpha = progress;
        
        // Background gradient
        const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
        grad.addColorStop(0, '#0a0a0b');
        grad.addColorStop(1, '#1a1a2b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Split screen effect
        if (progress > 0.2) {
            const splitProgress = (progress - 0.2) / 0.8;
            
            // Left side - chaos
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            for (let i = 0; i < 20; i++) {
                const x = 100 + Math.random() * 700;
                const y = 200 + Math.random() * 400;
                const w = 50 + Math.random() * 100;
                const h = 30 + Math.random() * 50;
                ctx.fillRect(x, y, w, h);
            }
            ctx.restore();
            
            // Right side - clean
            ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
            ctx.lineWidth = 2;
            this.roundRect(1120, 250, 700, 400, 20);
            ctx.fill();
            ctx.stroke();
        }
        
        // Main text
        if (progress > 0.5) {
            const textProgress = (progress - 0.5) / 0.5;
            ctx.globalAlpha = textProgress;
            
            ctx.font = '900 90px Inter';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText('Your whitespace worth', centerX, centerY + 150);
            
            // Gradient text
            const gradient = ctx.createLinearGradient(centerX - 200, 0, centerX + 200, 0);
            gradient.addColorStop(0, '#6366f1');
            gradient.addColorStop(1, '#ec4899');
            ctx.fillStyle = gradient;
            ctx.font = '900 110px Inter';
            ctx.fillText('$2.4M+', centerX, centerY + 270);
        }
        
        ctx.globalAlpha = 1;
    }
    
    drawScene2(progress) {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Background
        const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
        grad.addColorStop(0, '#0a0a0b');
        grad.addColorStop(1, '#1a1a2b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Data flow particles
        ctx.save();
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2 + progress * Math.PI;
            const radius = 200 * (1 - progress * 0.5);
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY - 100 + Math.sin(angle) * radius;
            
            ctx.fillStyle = `rgba(99, 102, 241, ${0.3 + progress * 0.5})`;
            ctx.beginPath();
            ctx.arc(x, y, 3 + progress * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        
        // Dashboard
        if (progress > 0.3) {
            const dashProgress = (progress - 0.3) / 0.7;
            ctx.globalAlpha = dashProgress;
            
            // Main panel
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 2;
            this.roundRect(centerX - 400, centerY - 250, 800, 400, 24);
            ctx.fill();
            ctx.stroke();
            
            // Cards inside
            for (let i = 0; i < 3; i++) {
                const x = centerX - 350 + i * 260;
                const y = centerY - 150;
                
                ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
                this.roundRect(x, y, 240, 120, 12);
                ctx.fill();
                
                // Values
                ctx.font = '600 32px Inter';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                const values = ['89%', '$2.4M', '3 weeks'];
                ctx.fillText(values[i], x + 120, y + 70);
            }
        }
        
        // Text
        if (progress > 0.5) {
            ctx.globalAlpha = (progress - 0.5) / 0.5;
            ctx.font = '700 64px Inter';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText('Custom tools for account teams', centerX, centerY + 250);
        }
        
        ctx.globalAlpha = 1;
    }
    
    drawScene3(progress) {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Background
        const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
        grad.addColorStop(0, '#0a0a0b');
        grad.addColorStop(1, '#1a1a2b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Benefits
        const benefits = [
            { icon: '⚡', text: '3 week delivery', x: centerX - 400 },
            { icon: '✅', text: '92% adoption rate', x: centerX },
            { icon: '🛠️', text: 'Built for you, not bought', x: centerX + 400 }
        ];
        
        benefits.forEach((benefit, i) => {
            const delay = i * 0.2;
            const benefitProgress = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
            
            if (benefitProgress > 0) {
                ctx.save();
                ctx.globalAlpha = benefitProgress;
                ctx.translate(benefit.x, centerY + (1 - benefitProgress) * 50);
                ctx.scale(0.8 + benefitProgress * 0.2, 0.8 + benefitProgress * 0.2);
                
                // Card
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 2;
                this.roundRect(-150, -100, 300, 200, 20);
                ctx.fill();
                ctx.stroke();
                
                // Icon
                ctx.font = '60px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(benefit.icon, 0, -20);
                
                // Text
                ctx.font = '600 24px Inter';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(benefit.text, 0, 60);
                
                ctx.restore();
            }
        });
    }
    
    drawScene4(progress) {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Background
        const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
        grad.addColorStop(0, '#0a0a0b');
        grad.addColorStop(1, '#1a1a2b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Logo
        ctx.save();
        ctx.globalAlpha = progress;
        ctx.translate(centerX, centerY - 100);
        ctx.scale(progress, progress);
        
        ctx.font = '900 100px Inter';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('Gloo', 0, 0);
        
        ctx.restore();
        
        // CTA
        if (progress > 0.3) {
            ctx.globalAlpha = (progress - 0.3) / 0.7;
            
            // Gradient text
            const gradient = ctx.createLinearGradient(centerX - 200, 0, centerX + 200, 0);
            gradient.addColorStop(0, '#6366f1');
            gradient.addColorStop(1, '#ec4899');
            ctx.fillStyle = gradient;
            ctx.font = '700 72px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Book a demo', centerX, centerY + 80);
            
            // URL
            ctx.font = '400 48px Inter';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('gluelabs.co', centerX, centerY + 160);
        }
        
        ctx.globalAlpha = 1;
    }
    
    drawParticles(progress) {
        const ctx = this.ctx;
        ctx.save();
        
        for (let i = 0; i < 20; i++) {
            const x = (i * 100 + progress * 1920) % 1920;
            const y = Math.sin(i + progress * Math.PI * 2) * 50 + this.height / 2;
            
            ctx.fillStyle = `rgba(99, 102, 241, ${0.1 + Math.sin(i + progress * 10) * 0.1})`;
            ctx.beginPath();
            ctx.arc(x, y, 2 + Math.sin(i) * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    roundRect(x, y, width, height, radius) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    
    export() {
        alert('To export:\n1. Use Chrome/Edge\n2. Play the full animation\n3. Use screen recording software\n4. Or use the PNG sequence export option');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.glooVideoAd = new GlooVideoAd();
});