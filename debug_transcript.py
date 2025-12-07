from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter

api = YouTubeTranscriptApi()
transcript = api.fetch("dQw4w9WgXcQ")

formatter = TextFormatter()

print("Trying with snippets:")
try:
    formatted = formatter.format_transcript(transcript.snippets)
    print("Formatter success with snippets!")
    print(formatted[:100])
except Exception as e:
    print(f"Formatter failed with snippets: {e}")

print("\nManual formatting:")
try:
    text = " ".join([s.text for s in transcript.snippets])
    print("Manual success!")
    print(text[:100])
except Exception as e:
    print(f"Manual failed: {e}")
