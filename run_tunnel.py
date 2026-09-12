"""
Automatic Cloudflare Tunnel Launcher & Live URL Synchronizer
Supports Custom Domain (https://legendtech.store) with automatic live monitoring
and Cloudflare tunnel fallback so the Netlify website ALWAYS stays online.
"""
import json
import os
import re
import subprocess
import sys
import time
import requests

GIST_ID = os.environ.get("GIST_ID", "da0d9dfca2f184444f8ea9b1f4d9e220")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
CUSTOM_DOMAIN = "https://legendtech.store"

def check_domain_healthy(url: str) -> bool:
    try:
        r = requests.get(f"{url.rstrip('/')}/health", timeout=4)
        if r.status_code == 200:
            data = r.json()
            if isinstance(data, dict) and data.get("status") == "ok":
                return True
    except Exception:
        pass
    return False

def sync_to_gist(active_url: str):
    print("\n" + "=" * 65, flush=True)
    print(f"[ACTIVE ENDPOINT URL] {active_url}", flush=True)
    print("Syncing URL to GitHub Gist so Netlify website updates automatically...", flush=True)
    try:
        headers = {
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "Accept": "application/vnd.github+json",
        }
        payload = {
            "files": {
                "tunnel.json": {
                    "content": json.dumps({"url": active_url})
                }
            }
        }
        r = requests.patch(
            f"https://api.github.com/gists/{GIST_ID}",
            headers=headers,
            json=payload,
            timeout=10,
        )
        if r.status_code == 200:
            print("[SUCCESS] Website is now synced and connected to this endpoint!", flush=True)
        else:
            print(f"[WARNING] Gist update status: {r.status_code}", flush=True)
    except Exception as e:
        print(f"[ERROR] Could not sync URL to Gist: {e}", flush=True)
    print("=" * 65 + "\n", flush=True)

def get_existing_tunnel_url() -> str | None:
    try:
        r = requests.get("http://127.0.0.1:20241/metrics", timeout=1.5)
        if r.status_code == 200:
            m = re.search(r'userHostname="([^"]+)"', r.text)
            if m:
                return m.group(1).strip()
    except Exception:
        pass
    return None

def main():
    print("=" * 65)
    print("Instagram API Domain & Tunnel Manager")
    print(f"Target Custom Domain: {CUSTOM_DOMAIN}")
    print("=" * 65)

    # Check if custom domain is already live and pointed to our backend
    if check_domain_healthy(CUSTOM_DOMAIN):
        print(f"[SUCCESS] Custom domain {CUSTOM_DOMAIN} is ACTIVE and responding!")
        sync_to_gist(CUSTOM_DOMAIN)
        print("Monitoring custom domain health. Press Ctrl+C to stop.")
        try:
            while True:
                time.sleep(15)
                if not check_domain_healthy(CUSTOM_DOMAIN):
                    print(f"[ALERT] Custom domain {CUSTOM_DOMAIN} stopped responding. Starting fallback tunnel...")
                    break
        except KeyboardInterrupt:
            return

    print(f"[INFO] Domain {CUSTOM_DOMAIN} is awaiting DNS pointing.")
    print("Launching Cloudflare fallback tunnel so the API is immediately online...")

    existing_url = get_existing_tunnel_url()
    if existing_url:
        print(f"Detected running Cloudflare tunnel at: {existing_url}")
        sync_to_gist(existing_url)
        print("Tunnel is actively proxying traffic. Monitoring tunnel & custom domain...")
        try:
            while True:
                time.sleep(10)
                if check_domain_healthy(CUSTOM_DOMAIN):
                    print(f"\n[GREAT NEWS!] Custom domain {CUSTOM_DOMAIN} is now LIVE!")
                    sync_to_gist(CUSTOM_DOMAIN)
                curr = get_existing_tunnel_url()
                if not curr:
                    print("Tunnel stopped. Restarting...")
                    break
                if curr != existing_url:
                    existing_url = curr
                    if not check_domain_healthy(CUSTOM_DOMAIN):
                        sync_to_gist(existing_url)
        except KeyboardInterrupt:
            return

    script_dir = os.path.dirname(os.path.abspath(__file__))
    cloudflared_path = os.path.join(script_dir, "cloudflared.exe")
    cmd = [cloudflared_path, "tunnel", "--url", "http://localhost:8000"]

    print(f"Launching: {' '.join(cmd)}")
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )

    tunnel_url = None
    try:
        for line in proc.stdout:
            sys.stdout.write(line)
            sys.stdout.flush()
            if not tunnel_url:
                match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", line)
                if match:
                    tunnel_url = match.group(0).strip()
                    if check_domain_healthy(CUSTOM_DOMAIN):
                        sync_to_gist(CUSTOM_DOMAIN)
                    else:
                        sync_to_gist(tunnel_url)
        proc.wait()
    except KeyboardInterrupt:
        proc.terminate()

if __name__ == "__main__":
    main()
