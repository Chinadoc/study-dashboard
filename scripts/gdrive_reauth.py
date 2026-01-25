#!/usr/bin/env python3
"""
Re-authenticate with Google Drive API and save new tokens.
Run this once to get a fresh access/refresh token.
"""

import json
import webbrowser
import http.server
import urllib.parse as urlparse

# Your Desktop CLI credentials
CLIENT_ID = "1057439383868-04gum028jlqtkr3sdj9bbblaf4dglmbc.apps.googleusercontent.com"
CLIENT_SECRET = "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"
REDIRECT_URI = "http://localhost:8888/callback"
SCOPES = "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/documents.readonly"
TOKEN_FILE = "gdrive_token.json"

auth_code = None

class CallbackHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        global auth_code
        query = urlparse.urlparse(self.path).query
        params = urlparse.parse_qs(query)
        if 'code' in params:
            auth_code = params['code'][0]
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"<html><body><h1>Success!</h1><p>You can close this window.</p></body></html>")
        else:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"<html><body><h1>Error</h1><p>No auth code received.</p></body></html>")

    def log_message(self, format, *args):
        pass  # Suppress logging

def main():
    global auth_code
    import requests
    
    # Step 1: Build the authorization URL
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={CLIENT_ID}&"
        f"redirect_uri={REDIRECT_URI}&"
        f"response_type=code&"
        f"scope={SCOPES.replace(' ', '%20')}&"
        f"access_type=offline&"
        f"prompt=consent"
    )
    
    print("=" * 60)
    print("🔐 GOOGLE DRIVE RE-AUTHENTICATION")
    print("=" * 60)
    print("\n1. Opening your browser to sign in with Google...")
    print("2. After you authorize, you'll be redirected back here.\n")
    
    # Start local server to catch the callback
    server = http.server.HTTPServer(('localhost', 8888), CallbackHandler)
    
    # Open browser
    webbrowser.open(auth_url)
    
    print("⏳ Waiting for authorization...")
    
    # Handle one request (the callback)
    server.handle_request()
    server.server_close()
    
    if not auth_code:
        print("❌ No authorization code received. Please try again.")
        return
    
    print("✅ Authorization code received!")
    
    # Step 2: Exchange auth code for tokens
    print("\n📡 Exchanging code for tokens...")
    response = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": auth_code,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
            "grant_type": "authorization_code"
        }
    )
    
    if response.status_code != 200:
        print(f"❌ Token exchange failed: {response.text}")
        return
    
    tokens = response.json()
    
    # Step 3: Save tokens
    creds = {
        "token": tokens["access_token"],
        "refresh_token": tokens.get("refresh_token"),
        "token_uri": "https://oauth2.googleapis.com/token",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "scopes": SCOPES.split(),
        "universe_domain": "googleapis.com",
        "account": "",
        "expiry": ""
    }
    
    with open(TOKEN_FILE, "w") as f:
        json.dump(creds, f, indent=2)
    
    print(f"\n✅ SUCCESS! Tokens saved to {TOKEN_FILE}")
    print("\nYou can now run: python3 scripts/fetch_gdrive_docs.py")

if __name__ == "__main__":
    main()
