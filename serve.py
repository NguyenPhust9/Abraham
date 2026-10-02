from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import re
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parent

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        if any(part.startswith('.') for part in Path(self.translate_path(self.path)).relative_to(ROOT).parts):
            self.send_error(404)
            return None
        url = urlsplit(self.path)
        if re.fullmatch(r"/san-pham/[a-z0-9-]+-\d+/?", url.path):
            self.path = "/product-detail.html"
            return super().send_head()
        target = Path(self.translate_path(url.path))
        canonical_path = None
        if url.path in ("/index", "/index.html"):
            canonical_path = "/"
        elif url.path.endswith(".html") and target.is_file():
            canonical_path = url.path[:-5]
        elif url.path != "/" and url.path.endswith("/"):
            clean = url.path.rstrip("/")
            if Path(self.translate_path(clean) + ".html").is_file():
                canonical_path = clean
        if canonical_path is not None:
            self.send_response(301)
            self.send_header("Location", urlunsplit(("", "", canonical_path, url.query, "")))
            self.end_headers()
            return None
        if not target.exists() and not target.suffix and Path(str(target) + ".html").is_file():
            self.path = urlunsplit(("", "", url.path + ".html", url.query, ""))
        return super().send_head()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 5500), Handler).serve_forever()
