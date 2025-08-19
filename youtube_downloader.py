#!/usr/bin/env python3
"""
YouTube Video Downloader
A simple script to download YouTube videos using yt-dlp
"""

import os
import sys
import argparse
from pathlib import Path

try:
    import yt_dlp
except ImportError:
    print("Error: yt-dlp is not installed.")
    print("Please install it using: pip install yt-dlp")
    sys.exit(1)


def download_video(url, output_path="downloads", quality="best", audio_only=False):
    """
    Download a YouTube video or audio
    
    Args:
        url: YouTube video URL
        output_path: Directory to save the downloaded file
        quality: Video quality (best, 1080, 720, 480, 360, etc.)
        audio_only: Download only audio if True
    """
    # Create output directory if it doesn't exist
    Path(output_path).mkdir(parents=True, exist_ok=True)
    
    # Configure yt-dlp options
    ydl_opts = {
        'outtmpl': os.path.join(output_path, '%(title)s.%(ext)s'),
        'quiet': False,
        'no_warnings': False,
        'progress': True,
    }
    
    if audio_only:
        # Audio-only options
        ydl_opts.update({
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        })
        print(f"Downloading audio from: {url}")
    else:
        # Video options
        if quality == "best":
            ydl_opts['format'] = 'best'
        elif quality in ['1080', '720', '480', '360']:
            ydl_opts['format'] = f'best[height<={quality}]'
        else:
            ydl_opts['format'] = 'best'
        print(f"Downloading video ({quality}p) from: {url}")
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Extract video info first
            info = ydl.extract_info(url, download=False)
            video_title = info.get('title', 'Unknown')
            duration = info.get('duration', 0)
            
            print(f"\nTitle: {video_title}")
            if duration:
                minutes, seconds = divmod(duration, 60)
                print(f"Duration: {minutes}:{seconds:02d}")
            
            # Download the video/audio
            print("\nStarting download...")
            ydl.download([url])
            
            print(f"\n✅ Download completed successfully!")
            print(f"📁 Saved to: {output_path}/")
            
    except yt_dlp.utils.DownloadError as e:
        print(f"\n❌ Download failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
        sys.exit(1)


def download_playlist(url, output_path="downloads", quality="best", audio_only=False):
    """
    Download an entire YouTube playlist
    
    Args:
        url: YouTube playlist URL
        output_path: Directory to save the downloaded files
        quality: Video quality
        audio_only: Download only audio if True
    """
    Path(output_path).mkdir(parents=True, exist_ok=True)
    
    ydl_opts = {
        'outtmpl': os.path.join(output_path, '%(playlist_index)s - %(title)s.%(ext)s'),
        'quiet': False,
        'no_warnings': False,
        'progress': True,
        'ignoreerrors': True,  # Continue on download errors
        'playliststart': 1,
        'playlistend': None,
    }
    
    if audio_only:
        ydl_opts.update({
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        })
    else:
        if quality == "best":
            ydl_opts['format'] = 'best'
        elif quality in ['1080', '720', '480', '360']:
            ydl_opts['format'] = f'best[height<={quality}]'
        else:
            ydl_opts['format'] = 'best'
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"Downloading playlist from: {url}")
            print(f"Quality: {quality}p, Audio only: {audio_only}")
            print("\nStarting download...\n")
            
            ydl.download([url])
            
            print(f"\n✅ Playlist download completed!")
            print(f"📁 Saved to: {output_path}/")
            
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Download YouTube videos and playlists",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s https://www.youtube.com/watch?v=VIDEO_ID
  %(prog)s -a https://www.youtube.com/watch?v=VIDEO_ID
  %(prog)s -q 720 https://www.youtube.com/watch?v=VIDEO_ID
  %(prog)s -p https://www.youtube.com/playlist?list=PLAYLIST_ID
  %(prog)s -o my_videos https://www.youtube.com/watch?v=VIDEO_ID
        """
    )
    
    parser.add_argument('url', help='YouTube video or playlist URL')
    parser.add_argument('-o', '--output', default='downloads', 
                        help='Output directory (default: downloads)')
    parser.add_argument('-q', '--quality', default='best',
                        choices=['best', '1080', '720', '480', '360'],
                        help='Video quality (default: best)')
    parser.add_argument('-a', '--audio', action='store_true',
                        help='Download audio only (MP3)')
    parser.add_argument('-p', '--playlist', action='store_true',
                        help='Download entire playlist')
    
    args = parser.parse_args()
    
    # Validate URL
    if not args.url.startswith(('https://www.youtube.com/', 'https://youtu.be/', 
                                'http://www.youtube.com/', 'http://youtu.be/')):
        print("❌ Invalid URL. Please provide a valid YouTube URL.")
        sys.exit(1)
    
    print("=" * 50)
    print("YouTube Downloader")
    print("=" * 50)
    
    if args.playlist or 'playlist' in args.url:
        download_playlist(args.url, args.output, args.quality, args.audio)
    else:
        download_video(args.url, args.output, args.quality, args.audio)


if __name__ == "__main__":
    main()