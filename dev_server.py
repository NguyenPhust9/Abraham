"""Local static server with the same clean-URL routes used by the website."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import socket


ROOT = Path(__file__).resolve().parent


class AbrahamHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        if any(part.startswith('.') for part in Path(self.translate_path(self.path)).relative_to(ROOT).parts):
            self.send_error(404)
            return None
        return super().send_head()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        super().end_headers()

    def do_GET(self):
        parsed = urlsplit(self.path)
        route = parsed.path.rstrip("/") or "/"

        if route.startswith("/san-pham/") or route.startswith("/product/"):
            target = "/product-detail.html"
        elif route == "/":
            target = "/index.html"
        elif not Path(route).suffix and (ROOT / f"{route.lstrip('/')}.html").is_file():
            target = f"{route}.html"
        else:
            target = parsed.path

        self.path = target + (f"?{parsed.query}" if parsed.query else "")
        super().do_GET()


class AbrahamServer(ThreadingHTTPServer):
    address_family = socket.AF_INET6


if __name__ == "__main__":
    AbrahamServer(("::", 8000), AbrahamHandler).serve_forever()
