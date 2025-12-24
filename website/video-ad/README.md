# Gloo 10-Second Video Ad

A professional animated video ad for Gloo, featuring smooth transitions, glassmorphism effects, and key messaging.

## Features

- **10-second duration** with 4 distinct scenes
- **Canvas-based animation** using GSAP for smooth transitions
- **Glassmorphism design** matching Gloo's brand aesthetic
- **60 FPS** smooth animation
- **Export options**:
  - WebM video (real-time recording)
  - PNG sequence (frame-by-frame export)
  - Preview GIF

## Video Structure

1. **Scene 1 (0-2s)**: Opening Hook
   - Split view: Chaos vs Clean interface
   - Text: "Your whitespace worth $2.4M+"

2. **Scene 2 (2-5s)**: Problem & Solution
   - Data flow animation
   - Dashboard preview
   - Text: "Custom tools for account teams"

3. **Scene 3 (5-8s)**: Key Benefits
   - 3 week delivery
   - 92% adoption rate
   - Built for you, not bought

4. **Scene 4 (8-10s)**: Call to Action
   - Gloo logo
   - "Book a demo"
   - Website: gluelabs.co

## How to Use

### Preview the Animation

1. Open `index.html` in a modern web browser
2. Click "Play Animation" to watch the full 10-second video
3. Use the timeline scrubber to jump to specific moments

### Export the Video

#### Option 1: WebM Video (Quickest)
1. Click "Export Video"
2. Choose option 1 (WebM Video)
3. The animation will play and record in real-time
4. Video will download automatically as `gloo-ad-10s.webm`

#### Option 2: PNG Sequence (Highest Quality)
1. Click "Export Video"
2. Choose option 2 (PNG Sequence)
3. All 600 frames (60fps × 10s) will be exported
4. Use the included `compile-video.py` script to create MP4

### Compile to MP4

After exporting PNG sequence:

```bash
cd video-ad
python3 compile-video.py
```

This creates:
- `gloo-ad-10s.mp4` - Main video (1920×1080)
- `gloo-ad-instagram.mp4` - Square version (1080×1080)
- `gloo-ad-instagram-story.mp4` - Vertical version (1080×1920)
- `gloo-ad-twitter.mp4` - Horizontal version (1280×720)
- `gloo-ad-preview.gif` - Animated GIF preview

## Requirements

- Modern web browser (Chrome, Firefox, Safari)
- For MP4 compilation: Python 3 and ffmpeg
  ```bash
  brew install ffmpeg  # macOS
  ```

## Customization

- **Colors**: Edit CSS variables in `video-ad.css`
- **Text**: Modify text content in `video-ad.js`
- **Timing**: Adjust timeline in `createTimeline()` method
- **Effects**: Modify particle effects and transitions

## Technical Details

- **Resolution**: 1920×1080 (16:9)
- **Frame Rate**: 60 FPS
- **Duration**: 10 seconds
- **File Formats**: WebM, MP4, PNG sequence, GIF
- **Libraries**: GSAP for animation, Canvas API for rendering

## File Structure

```
video-ad/
├── index.html          # Main animation page
├── video-ad.css        # Styling and effects
├── video-ad.js         # Animation logic
├── export-video.js     # Export functionality
├── compile-video.py    # Python script for MP4 compilation
└── README.md          # This file
```

## Browser Support

- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

## Tips

- For best quality, export as PNG sequence and compile with ffmpeg
- The WebM export is faster but may have lower quality
- Adjust CRF value in compile-video.py for quality/size tradeoff
- Use preview GIF for quick sharing and approval