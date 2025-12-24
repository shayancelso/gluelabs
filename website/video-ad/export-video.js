// Video Export Script for Gloo Ad
// This script captures frames from the canvas animation and exports them as a video

class VideoExporter {
    constructor(animation, canvas) {
        this.animation = animation;
        this.canvas = canvas;
        this.fps = 60;
        this.duration = 10; // 10 seconds
        this.totalFrames = this.fps * this.duration;
        this.currentFrame = 0;
        this.frames = [];
        
        // For actual video export, we would use CCapture.js
        // For demonstration, we'll create a frame sequence
    }
    
    async exportFrames() {
        console.log('Starting frame export...');
        
        // Reset animation to beginning
        this.animation.timeline.seek(0);
        
        // Capture frames
        for (let i = 0; i < this.totalFrames; i++) {
            const time = (i / this.totalFrames) * this.duration;
            
            // Seek to specific time
            this.animation.timeline.seek(time);
            
            // Force render
            this.animation.timeline.progress(time / this.duration);
            
            // Capture frame
            await this.captureFrame(i);
            
            // Update progress
            const progress = ((i + 1) / this.totalFrames) * 100;
            console.log(`Progress: ${progress.toFixed(1)}%`);
        }
        
        console.log('Frame export complete!');
        return this.frames;
    }
    
    async captureFrame(frameNumber) {
        // Convert canvas to blob
        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                this.frames.push({
                    frame: frameNumber,
                    blob: blob,
                    timestamp: frameNumber / this.fps
                });
                resolve();
            }, 'image/png', 1.0);
        });
    }
    
    // Create a WebM video using the frames
    async createVideo() {
        // For actual implementation, we would use:
        // 1. MediaRecorder API for real-time recording
        // 2. Or ffmpeg.wasm for client-side video encoding
        // 3. Or send frames to server for processing
        
        console.log('Creating video from frames...');
        
        // Example using MediaRecorder (real-time recording)
        const stream = this.canvas.captureStream(this.fps);
        const recorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 8000000 // 8 Mbps
        });
        
        const chunks = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        
        return new Promise((resolve) => {
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                resolve(blob);
            };
            
            // Start recording
            recorder.start();
            
            // Play animation
            this.animation.timeline.restart();
            
            // Stop after duration
            setTimeout(() => {
                recorder.stop();
                this.animation.timeline.pause();
            }, this.duration * 1000);
        });
    }
    
    // Download the video
    downloadVideo(videoBlob, filename = 'gloo-ad-10s.webm') {
        const url = URL.createObjectURL(videoBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Alternative: Export as image sequence
    async exportImageSequence() {
        const frames = await this.exportFrames();
        
        // Create a zip file with all frames
        console.log(`Exported ${frames.length} frames`);
        
        // For each frame, download as PNG
        frames.forEach((frameData, index) => {
            const url = URL.createObjectURL(frameData.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `frame_${String(index).padStart(4, '0')}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
    
    // Create preview GIF (lower quality, smaller file)
    async createPreviewGIF() {
        // This would use gif.js or similar library
        console.log('Creating preview GIF...');
        
        // Sample every 3rd frame for smaller file
        const skipFrames = 3;
        const gifFrames = [];
        
        for (let i = 0; i < this.totalFrames; i += skipFrames) {
            const time = (i / this.totalFrames) * this.duration;
            this.animation.timeline.seek(time);
            
            // Capture frame at lower resolution
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 960; // Half resolution
            tempCanvas.height = 540;
            const ctx = tempCanvas.getContext('2d');
            ctx.drawImage(this.canvas, 0, 0, 960, 540);
            
            gifFrames.push(tempCanvas);
        }
        
        console.log(`Created GIF with ${gifFrames.length} frames`);
        return gifFrames;
    }
}

// Export function to be called from main script
async function exportGlooVideo() {
    const animation = window.videoAnimation; // Reference to main animation instance
    const canvas = document.getElementById('video-canvas');
    
    if (!animation || !canvas) {
        console.error('Animation or canvas not found');
        return;
    }
    
    const exporter = new VideoExporter(animation, canvas);
    
    // Show export options
    const exportType = prompt(
        'Choose export format:\n' +
        '1. WebM Video (Real-time recording)\n' +
        '2. PNG Sequence (Frame by frame)\n' +
        '3. Preview GIF (Lower quality)',
        '1'
    );
    
    try {
        switch (exportType) {
            case '1':
                console.log('Starting WebM video export...');
                const videoBlob = await exporter.createVideo();
                exporter.downloadVideo(videoBlob);
                break;
                
            case '2':
                console.log('Starting PNG sequence export...');
                await exporter.exportImageSequence();
                break;
                
            case '3':
                console.log('Starting GIF preview export...');
                const gifFrames = await exporter.createPreviewGIF();
                alert(`GIF preview ready with ${gifFrames.length} frames. (GIF encoding library needed for final export)`);
                break;
                
            default:
                console.log('Export cancelled');
        }
    } catch (error) {
        console.error('Export error:', error);
        alert('Export failed. Check console for details.');
    }
}

// Attach to window for global access
window.exportGlooVideo = exportGlooVideo;