import json
import re
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter

def fetch_transcripts():
    # Read video data
    try:
        with open('video_data.json', 'r') as f:
            video_data = json.load(f)
    except FileNotFoundError:
        print("Error: video_data.json not found.")
        return

    output_file = 'notebooklm_source.txt'
    formatter = TextFormatter()
    
    # Instantiate API
    try:
        api = YouTubeTranscriptApi()
    except Exception as e:
        print(f"Error instantiating YouTubeTranscriptApi: {e}")
        return

    with open(output_file, 'w', encoding='utf-8') as out_f:
        out_f.write("Source Material for Automotive Locksmithing\n")
        out_f.write("=========================================\n\n")
        
        total_videos = 0
        success_count = 0
        
        for entry in video_data:
            make = entry.get('make', 'Unknown')
            model = entry.get('model', 'Unknown')
            year_range = entry.get('year_range', 'Unknown')
            
            for video in entry.get('videos', []):
                total_videos += 1
                title = video.get('title', 'No Title')
                url = video.get('url', '')
                
                # Extract video ID
                video_id = ''
                if 'youtube.com/watch?v=' in url:
                    video_id = url.split('v=')[1].split('&')[0]
                elif 'youtu.be/' in url:
                    video_id = url.split('youtu.be/')[1].split('?')[0]
                
                if not video_id:
                    # print(f"Skipping non-YouTube URL: {url}")
                    continue
                
                print(f"Processing: {title} ({video_id})")
                
                try:
                    # Fetch transcript using instance method
                    transcript = api.fetch(video_id)
                    
                    # Format using snippets
                    transcript_text = formatter.format_transcript(transcript.snippets)
                    
                    # Write to file
                    out_f.write(f"Title: {title}\n")
                    out_f.write(f"Vehicle: {make} {model} ({year_range})\n")
                    out_f.write(f"URL: {url}\n")
                    out_f.write(f"Category: Key Programming Tutorial\n\n")
                    out_f.write("Transcript:\n")
                    out_f.write(transcript_text)
                    out_f.write("\n\n" + "-"*40 + "\n\n")
                    
                    success_count += 1
                    
                except Exception as e:
                    print(f"Could not fetch transcript for {video_id}: {e}")
                    # Only write metadata if failed, or maybe skip? 
                    # Let's write metadata so NotebookLM knows about the video even if no transcript
                    out_f.write(f"Title: {title}\n")
                    out_f.write(f"Vehicle: {make} {model} ({year_range})\n")
                    out_f.write(f"URL: {url}\n")
                    out_f.write(f"Note: Transcript unavailable ({str(e)})\n\n")
                    out_f.write("-"*40 + "\n\n")

    print(f"\nFinished. Processed {total_videos} videos. Successfully fetched {success_count} transcripts.")
    print(f"Output saved to {output_file}")

if __name__ == "__main__":
    fetch_transcripts()
