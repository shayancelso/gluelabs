#!/usr/bin/env python3
"""
Compile exported frames into MP4 video using ffmpeg
Usage: python3 compile-video.py
"""

import os
import subprocess
import sys

def check_ffmpeg():
    """Check if ffmpeg is installed"""
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True)
        return True
    except FileNotFoundError:
        print("Error: ffmpeg is not installed.")
        print("Install it using: brew install ffmpeg")
        return False

def compile_video(input_pattern='frame_%04d.png', output='gloo-ad-10s.mp4', fps=60):
    """Compile PNG frames into MP4 video"""
    
    if not check_ffmpeg():
        return False
    
    # FFmpeg command for high-quality MP4
    cmd = [
        'ffmpeg',
        '-y',  # Overwrite output file
        '-framerate', str(fps),  # Input framerate
        '-i', input_pattern,  # Input file pattern
        '-c:v', 'libx264',  # Video codec
        '-preset', 'slow',  # Encoding preset (slow = better quality)
        '-crf', '18',  # Quality (lower = better, 18 is visually lossless)
        '-pix_fmt', 'yuv420p',  # Pixel format for compatibility
        '-movflags', '+faststart',  # Web optimization
        output
    ]
    
    print(f"Compiling video at {fps}fps...")
    print(f"Command: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"Success! Video saved as: {output}")
            
            # Get file size
            size_mb = os.path.getsize(output) / (1024 * 1024)
            print(f"File size: {size_mb:.2f} MB")
            
            # Create additional formats
            create_social_media_versions(output)
            
            return True
        else:
            print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"Error compiling video: {e}")
        return False

def create_social_media_versions(input_file):
    """Create different versions for social media platforms"""
    
    versions = [
        {
            'name': 'gloo-ad-instagram.mp4',
            'size': '1080:1080',
            'desc': 'Instagram Square (1:1)'
        },
        {
            'name': 'gloo-ad-instagram-story.mp4',
            'size': '1080:1920',
            'desc': 'Instagram Story (9:16)'
        },
        {
            'name': 'gloo-ad-twitter.mp4',
            'size': '1280:720',
            'desc': 'Twitter/X (16:9)'
        }
    ]
    
    print("\nCreating social media versions...")
    
    for version in versions:
        cmd = [
            'ffmpeg',
            '-y',
            '-i', input_file,
            '-vf', f"scale={version['size']}:force_original_aspect_ratio=decrease,pad={version['size']}:(ow-iw)/2:(oh-ih)/2:black",
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '23',
            version['name']
        ]
        
        try:
            subprocess.run(cmd, capture_output=True)
            print(f"✓ Created {version['desc']}: {version['name']}")
        except:
            print(f"✗ Failed to create {version['desc']}")

def create_preview_gif():
    """Create a preview GIF from the video"""
    
    if not os.path.exists('gloo-ad-10s.mp4'):
        print("Error: Video file not found. Compile video first.")
        return
    
    print("\nCreating preview GIF...")
    
    cmd = [
        'ffmpeg',
        '-y',
        '-i', 'gloo-ad-10s.mp4',
        '-vf', 'fps=15,scale=480:-1:flags=lanczos',
        '-loop', '0',
        'gloo-ad-preview.gif'
    ]
    
    try:
        subprocess.run(cmd, capture_output=True)
        print("✓ Created preview GIF: gloo-ad-preview.gif")
    except:
        print("✗ Failed to create preview GIF")

def main():
    """Main function"""
    
    print("Gloo Video Ad Compiler")
    print("=" * 50)
    
    # Check if frames exist
    frames_exist = any(f.startswith('frame_') and f.endswith('.png') for f in os.listdir('.'))
    
    if not frames_exist:
        print("No frame files found.")
        print("Export frames from the web interface first.")
        print("1. Open index.html in a browser")
        print("2. Click 'Play Animation' to preview")
        print("3. Click 'Export Video' and choose 'PNG Sequence'")
        return
    
    # Compile main video
    if compile_video():
        # Create preview GIF
        create_preview_gif()
        
        print("\n✅ All done!")
        print("\nGenerated files:")
        print("- gloo-ad-10s.mp4 (Main video)")
        print("- gloo-ad-instagram.mp4 (Square)")
        print("- gloo-ad-instagram-story.mp4 (Vertical)")
        print("- gloo-ad-twitter.mp4 (Horizontal)")
        print("- gloo-ad-preview.gif (Preview)")

if __name__ == "__main__":
    main()