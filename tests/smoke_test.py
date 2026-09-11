"""Dependency-free smoke test for the CareLink static application."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.request import urlopen


ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def fetch(base_url, path):
    with urlopen(f"{base_url}/{path}", timeout=5) as response:
        assert response.status == 200, f"{path} returned {response.status}"
        return response.read().decode()


def main():
    handler = lambda *args, **kwargs: QuietHandler(*args, directory=ROOT, **kwargs)
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()

    try:
        base_url = f"http://127.0.0.1:{server.server_port}"
        html = fetch(base_url, "index.html")
        css = fetch(base_url, "styles.css")
        javascript = fetch(base_url, "app.js")

        assert 'id="referralForm"' in html
        assert 'id="joinConsultation"' in html
        assert 'aria-live="polite"' in html
        assert "@media(max-width:760px)" in css
        assert "localStorage.setItem" in javascript
        assert "renderReferrals" in javascript
        print(f"CareLink smoke test passed at {base_url}")
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


if __name__ == "__main__":
    main()
