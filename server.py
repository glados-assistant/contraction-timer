from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

PORT = int(os.environ.get('PORT', '8787'))
ROOT = Path(__file__).resolve().parent

os.chdir(ROOT)
server = ThreadingHTTPServer(('0.0.0.0', PORT), SimpleHTTPRequestHandler)
print(f'Serving {ROOT} on port {PORT}', flush=True)
server.serve_forever()
