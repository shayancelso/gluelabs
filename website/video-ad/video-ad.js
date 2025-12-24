// Gloo 10-Second Video Ad Animation
class VideoAdAnimation {
    constructor() {
        this.canvas = document.getElementById('video-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.timeline = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 10; // 10 seconds
        this.fps = 60;
        this.particles = [];
        
        this.init();
    }
    
    init() {
        // Set up canvas size
        this.canvas.width = 1920;
        this.canvas.height = 1080;
        
        // Create particles for effects
        this.createParticles();
        
        // Set up controls
        this.setupControls();
        
        // Create main timeline
        this.createTimeline();
        
        // Start render loop
        this.render();
    }
    
    createParticles() {
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    createTimeline() {
        // Create GSAP timeline
        this.timeline = gsap.timeline({
            paused: true,
            onUpdate: () => {
                this.currentTime = this.timeline.time();
                document.getElementById('timeline-scrubber').value = this.currentTime;
                document.getElementById('time-display').textContent = this.currentTime.toFixed(1) + 's';
                this.renderFrame();
            }
        });
        
        // Animation properties object
        const animProps = {
            scene1Progress: 0,
            scene2Progress: 0,
            scene3Progress: 0,
            scene4Progress: 0
        };
        
        // Scene 1: Opening Hook (0-2s)
        this.timeline
            .to(animProps, {
                scene1Progress: 1,
                duration: 2,
                ease: "power2.inOut",
                onUpdate: () => this.drawScene1(animProps.scene1Progress)
            }, 0);
        
        // Scene 2: Problem & Solution (2-5s)
        this.timeline
            .to(animProps, {
                scene2Progress: 1,
                duration: 3,
                ease: "power3.inOut",
                onUpdate: () => this.drawScene2(animProps.scene2Progress)
            }, 2);
        
        // Scene 3: Benefits (5-8s)
        this.timeline
            .to(animProps, {
                scene3Progress: 1,
                duration: 3,
                ease: "back.out(1.2)",
                onUpdate: () => this.drawScene3(animProps.scene3Progress)
            }, 5);
        
        // Scene 4: CTA (8-10s)
        this.timeline
            .to(animProps, {
                scene4Progress: 1,
                duration: 2,
                ease: "power4.out",
                onUpdate: () => this.drawScene4(animProps.scene4Progress)
            }, 8);
    }
    
    renderFrame() {
        this.clearCanvas();
        this.drawBackground();
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawBackground() {
        // Gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#0a0a0b');
        gradient.addColorStop(1, '#1a1a1b');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw particles
        this.updateParticles();
    }
    
    updateParticles() {
        this.ctx.save();
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            this.ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.restore();
    }
    
    drawScene1(progress) {
        this.clearCanvas();
        this.drawBackground();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Split view animation
        const splitProgress = Math.min(progress * 2, 1);
        
        // Chaos side (left)
        this.ctx.save();
        this.ctx.globalAlpha = splitProgress;
        this.drawChaosSpreadsheet(100, centerY - 200, 700, 400, 1 - splitProgress);
        this.ctx.restore();
        
        // Clean side (right)
        this.ctx.save();
        this.ctx.globalAlpha = splitProgress;
        this.drawCleanInterface(1120, centerY - 200, 700, 400, splitProgress);
        this.ctx.restore();
        
        // Text animation
        if (progress > 0.3) {
            const textProgress = (progress - 0.3) / 0.7;
            this.ctx.save();
            this.ctx.globalAlpha = textProgress;
            
            // Main text
            this.ctx.font = '900 100px Space Grotesk';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Your whitespace worth', centerX, centerY + 200);
            
            // Highlight text with gradient
            const gradient = this.ctx.createLinearGradient(centerX - 200, centerY + 250, centerX + 200, centerY + 250);
            gradient.addColorStop(0, '#6366f1');
            gradient.addColorStop(1, '#ec4899');
            this.ctx.fillStyle = gradient;
            this.ctx.font = '900 120px Space Grotesk';
            this.ctx.fillText('$2.4M+', centerX, centerY + 320);
            
            this.ctx.restore();
        }
    }
    
    drawChaosSpreadsheet(x, y, width, height, chaos) {
        // Draw messy grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        const cellSize = 40;
        for (let i = 0; i < width / cellSize; i++) {
            for (let j = 0; j < height / cellSize; j++) {
                const offsetX = (Math.random() - 0.5) * 10 * chaos;
                const offsetY = (Math.random() - 0.5) * 10 * chaos;
                
                this.ctx.strokeRect(
                    x + i * cellSize + offsetX,
                    y + j * cellSize + offsetY,
                    cellSize,
                    cellSize
                );
                
                // Random data
                if (Math.random() > 0.7) {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.font = '12px monospace';
                    this.ctx.fillText(
                        Math.floor(Math.random() * 9999).toString(),
                        x + i * cellSize + 5 + offsetX,
                        y + j * cellSize + 20 + offsetY
                    );
                }
            }
        }
    }
    
    drawCleanInterface(x, y, width, height, progress) {
        // Glass morphism panel
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 2;
        
        // Main panel
        this.roundRect(x, y, width, height, 20);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw clean data visualization
        const padding = 40;
        const chartX = x + padding;
        const chartY = y + padding;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        // Bars
        const barCount = 5;
        const barWidth = chartWidth / (barCount * 2);
        const maxHeight = chartHeight * 0.8;
        
        for (let i = 0; i < barCount; i++) {
            const barHeight = (Math.sin(i * 0.5 + progress * Math.PI) * 0.5 + 0.5) * maxHeight;
            const barX = chartX + i * (barWidth * 2) + barWidth / 2;
            const barY = chartY + chartHeight - barHeight;
            
            const gradient = this.ctx.createLinearGradient(barX, barY + barHeight, barX, barY);
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0.8)');
            
            this.ctx.fillStyle = gradient;
            this.roundRect(barX, barY, barWidth, barHeight, 8);
            this.ctx.fill();
        }
    }
    
    drawScene2(progress) {
        this.clearCanvas();
        this.drawBackground();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Data flow effect
        this.drawDataFlow(centerX, centerY, progress);
        
        // Dashboard preview
        if (progress > 0.3) {
            const dashboardProgress = (progress - 0.3) / 0.7;
            this.drawDashboard(centerX, centerY - 100, dashboardProgress);
        }
        
        // Text
        if (progress > 0.5) {
            const textProgress = (progress - 0.5) / 0.5;
            this.ctx.save();
            this.ctx.globalAlpha = textProgress;
            this.ctx.font = '700 72px Space Grotesk';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Custom tools for account teams', centerX, centerY + 300);
            this.ctx.restore();
        }
    }
    
    drawDataFlow(centerX, centerY, progress) {
        const particleCount = 30;
        const radius = 300;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + progress * Math.PI * 2;
            const distance = radius * (1 - progress);
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            const size = 3 + Math.sin(i + progress * 10) * 2;
            const opacity = 0.3 + progress * 0.7;
            
            this.ctx.fillStyle = `rgba(99, 102, 241, ${opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Trail
            if (i % 3 === 0) {
                this.ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.3})`;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(centerX, centerY);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
            }
        }
    }
    
    drawDashboard(centerX, centerY, progress) {
        const width = 800 * progress;
        const height = 500 * progress;
        const x = centerX - width / 2;
        const y = centerY - height / 2;
        
        // Main panel with glass effect
        this.ctx.save();
        this.ctx.globalAlpha = progress;
        
        // Shadow
        this.ctx.shadowColor = 'rgba(99, 102, 241, 0.3)';
        this.ctx.shadowBlur = 30;
        this.ctx.shadowOffsetY = 10;
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        
        this.roundRect(x, y, width, height, 24);
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.restore();
        
        // Content inside dashboard
        if (progress > 0.5) {
            const contentAlpha = (progress - 0.5) * 2;
            this.ctx.save();
            this.ctx.globalAlpha = contentAlpha;
            
            // Header
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.roundRect(x + 30, y + 30, width - 60, 60, 12);
            this.ctx.fill();
            
            // Cards
            const cardWidth = (width - 120) / 3;
            for (let i = 0; i < 3; i++) {
                const cardX = x + 30 + i * (cardWidth + 15);
                const cardY = y + 120;
                
                this.ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
                this.roundRect(cardX, cardY, cardWidth, 150, 12);
                this.ctx.fill();
                
                // Metric value
                this.ctx.font = '600 36px Inter';
                this.ctx.fillStyle = '#ffffff';
                this.ctx.textAlign = 'center';
                const values = ['$2.4M', '89%', '3 weeks'];
                this.ctx.fillText(values[i], cardX + cardWidth / 2, cardY + 80);
            }
            
            this.ctx.restore();
        }
    }
    
    drawScene3(progress) {
        this.clearCanvas();
        this.drawBackground();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        const benefits = [
            { icon: '⚡', text: '3 week delivery', delay: 0 },
            { icon: '✓', text: '92% adoption rate', delay: 0.2 },
            { icon: '🛠', text: 'Built for you, not bought', delay: 0.4 }
        ];
        
        benefits.forEach((benefit, index) => {
            const benefitProgress = Math.max(0, Math.min(1, (progress - benefit.delay) / (1 - benefit.delay)));
            const x = centerX - 400 + index * 400;
            const y = centerY;
            
            this.drawBenefit(x, y, benefit.icon, benefit.text, benefitProgress);
        });
    }
    
    drawBenefit(x, y, icon, text, progress) {
        const scale = 0.8 + progress * 0.2;
        const yOffset = (1 - progress) * 50;
        
        this.ctx.save();
        this.ctx.globalAlpha = progress;
        this.ctx.translate(x, y + yOffset);
        this.ctx.scale(scale, scale);
        
        // Card background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 2;
        
        this.roundRect(-120, -100, 240, 200, 20);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Icon
        this.ctx.font = '60px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(icon, 0, -20);
        
        // Text
        this.ctx.font = '600 24px Space Grotesk';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(text, 0, 60);
        
        this.ctx.restore();
    }
    
    drawScene4(progress) {
        this.clearCanvas();
        this.drawBackground();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Logo animation
        const logoScale = progress * 1.2;
        const logoRotation = progress * 0.1;
        
        this.ctx.save();
        this.ctx.globalAlpha = progress;
        this.ctx.translate(centerX, centerY - 100);
        this.ctx.scale(logoScale, logoScale);
        this.ctx.rotate(logoRotation);
        
        // Logo placeholder (since we need to load the actual image)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '900 80px Space Grotesk';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Gloo', 0, 0);
        
        this.ctx.restore();
        
        // CTA text
        if (progress > 0.3) {
            const ctaProgress = (progress - 0.3) / 0.7;
            
            this.ctx.save();
            this.ctx.globalAlpha = ctaProgress;
            
            // "Book a demo" with gradient
            const gradient = this.ctx.createLinearGradient(centerX - 200, centerY + 50, centerX + 200, centerY + 50);
            gradient.addColorStop(0, '#6366f1');
            gradient.addColorStop(1, '#ec4899');
            
            this.ctx.font = '700 64px Space Grotesk';
            this.ctx.fillStyle = gradient;
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Book a demo', centerX, centerY + 80);
            
            // Website URL
            this.ctx.font = '500 40px Inter';
            this.ctx.fillStyle = '#94a3b8';
            this.ctx.fillText('gluelabs.co', centerX, centerY + 150);
            
            this.ctx.restore();
        }
        
        // Add some flourish particles
        if (progress > 0.5) {
            const particleProgress = (progress - 0.5) * 2;
            this.drawFlourishParticles(centerX, centerY, particleProgress);
        }
    }
    
    drawFlourishParticles(centerX, centerY, progress) {
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = 200 + progress * 100;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            const size = 2 + Math.sin(i * 2 + progress * 10) * 3;
            const opacity = (1 - progress) * 0.6;
            
            this.ctx.fillStyle = `rgba(236, 72, 153, ${opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    // Utility function for rounded rectangles
    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
    
    setupControls() {
        const playBtn = document.getElementById('play-btn');
        const exportBtn = document.getElementById('export-btn');
        const scrubber = document.getElementById('timeline-scrubber');
        
        playBtn.addEventListener('click', () => {
            if (this.isPlaying) {
                this.timeline.pause();
                playBtn.textContent = 'Play Animation';
            } else {
                this.timeline.play();
                playBtn.textContent = 'Pause';
            }
            this.isPlaying = !this.isPlaying;
        });
        
        exportBtn.addEventListener('click', () => {
            this.exportVideo();
        });
        
        scrubber.addEventListener('input', (e) => {
            const time = parseFloat(e.target.value);
            this.timeline.seek(time);
            document.getElementById('time-display').textContent = time.toFixed(1) + 's';
        });
    }
    
    render() {
        // Initial render to show first frame
        if (!this.hasRendered) {
            this.renderFrame();
            this.drawScene1(0); // Show first frame
            this.hasRendered = true;
        }
        requestAnimationFrame(() => this.render());
    }
    
    exportVideo() {
        // Use the export functionality from export-video.js
        if (window.exportGlooVideo) {
            window.exportGlooVideo();
        } else {
            console.error('Export script not loaded');
            alert('Please ensure export-video.js is loaded');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.videoAnimation = new VideoAdAnimation();
});