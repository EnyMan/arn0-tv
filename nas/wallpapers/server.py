"""Wallpaper service for the launcher, meant to run in Docker on a NAS on the home network.

  GET  /            page to upload and delete photos
  POST /upload      multipart form: one or more `photo` files, optional `title`
  POST /delete      form field `key`
  GET  /list.json   {"wallpapers": [{key, title, file, thumb}]}, URLs relative to this file
  GET  /img/<key>.jpg, /thumbs/<key>.jpg

Each upload is turned into what the launcher expects (see scripts/prepare-wallpapers.mjs): a
1920x1080 cover crop with the readability scrim baked in, so the TV only ever draws a plain
JPEG. The original is kept in /data/originals in case the scrim ever changes.

No authentication: anyone on the network can add or delete photos. Do not expose the port to
the internet.
"""
import html
import io
import json
import os
import re
import secrets
import threading
import unicodedata
from email.parser import BytesParser
from email.policy import HTTP
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from PIL import Image, ImageChops, ImageOps
from pillow_heif import register_heif_opener

register_heif_opener()

DATA = os.environ.get('DATA_DIR', '/data')
PORT = int(os.environ.get('PORT', '8090'))
MAX_UPLOAD = 200 * 1024 * 1024
W, H = 1920, 1080
KEY_RE = re.compile(r'^nas-[a-z0-9-]{1,48}$')

lock = threading.Lock()  # one writer at a time for the catalog and image files


def path(*parts):
    return os.path.join(DATA, *parts)


for d in ('img', 'thumbs', 'originals'):
    os.makedirs(path(d), exist_ok=True)


# ---------- Scrim (same as SCRIM in scripts/prepare-wallpapers.mjs)

def build_scrim():
    """'L' image of how much light survives at each pixel (255 = untouched)."""
    # linear-gradient(to bottom, .25 0%, .30 30%, .62 62%, .82 100%)
    stops = [(0.0, 0.25), (0.30, 0.30), (0.62, 0.62), (1.0, 0.82)]

    def linear(t):
        for (t0, a0), (t1, a1) in zip(stops, stops[1:]):
            if t <= t1:
                return a0 + (a1 - a0) * (t - t0) / (t1 - t0)
        return stops[-1][1]

    column = Image.new('L', (1, H))
    column.putdata([round(255 * (1 - linear(y / (H - 1)))) for y in range(H)])
    vertical = column.resize((W, H))

    # radial-gradient(1300px 700px at 0% 0%, .55, transparent 70%)
    rx, ry = 1300, 700
    corner = Image.new('L', (W, H), 255)
    reach_x, reach_y = int(rx * 0.7) + 1, int(ry * 0.7) + 1
    values = []
    for y in range(reach_y):
        for x in range(reach_x):
            d = ((x / rx) ** 2 + (y / ry) ** 2) ** 0.5
            values.append(round(255 * (1 - 0.55 * max(0.0, 1 - d / 0.7))))
    patch = Image.new('L', (reach_x, reach_y))
    patch.putdata(values)
    corner.paste(patch, (0, 0))

    light = ImageChops.multiply(vertical, corner)
    return Image.merge('RGB', (light, light, light))


SCRIM = build_scrim()


# ---------- Catalog

def load():
    try:
        with open(path('catalog.json'), encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return []


def save(catalog):
    tmp = path('catalog.json.tmp')
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, ensure_ascii=False, indent=1)
    os.replace(tmp, path('catalog.json'))


def make_key(name):
    ascii_name = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode().lower()
    slug = re.sub(r'[^a-z0-9]+', '-', ascii_name).strip('-')[:36] or 'photo'
    return 'nas-%s-%s' % (slug, secrets.token_hex(2))


def add_photo(filename, data, title):
    img = Image.open(io.BytesIO(data))
    img = ImageOps.exif_transpose(img).convert('RGB')
    wallpaper = ImageChops.multiply(ImageOps.fit(img, (W, H), Image.LANCZOS), SCRIM)

    stem = os.path.splitext(os.path.basename(filename))[0]
    key = make_key(stem)
    with lock:
        with open(path('originals', key + os.path.splitext(filename)[1].lower()), 'wb') as f:
            f.write(data)
        wallpaper.save(path('img', key + '.jpg'), 'JPEG', quality=82)
        wallpaper.resize((320, 180), Image.LANCZOS).save(path('thumbs', key + '.jpg'), 'JPEG', quality=78)
        catalog = load()
        catalog.append({'key': key, 'title': title or stem})
        save(catalog)
    return key


def delete_photo(key):
    if not KEY_RE.match(key):
        return
    with lock:
        save([w for w in load() if w['key'] != key])
        for d in ('img', 'thumbs'):
            try:
                os.remove(path(d, key + '.jpg'))
            except FileNotFoundError:
                pass
        for f in os.listdir(path('originals')):
            if os.path.splitext(f)[0] == key:
                os.remove(path('originals', f))


# ---------- HTTP

PAGE = """<!doctype html><html lang="cs"><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tapety pro TV</title>
<style>
body{{font:16px system-ui,sans-serif;margin:0 auto;max-width:1100px;padding:16px;background:#111;color:#eee}}
form.up{{background:#1d1d1d;padding:16px;border-radius:12px;display:flex;gap:12px;flex-wrap:wrap;align-items:center}}
input,button{{font:inherit}} button{{padding:8px 16px;border-radius:8px;border:0;background:#3e8eff;color:#fff;cursor:pointer}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin-top:24px}}
.card{{background:#1d1d1d;border-radius:12px;overflow:hidden}} .card img{{width:100%;display:block;aspect-ratio:16/9}}
.card div{{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;gap:8px}}
.card button{{background:#a33}} .msg{{color:#f88}}
</style>
<h1>Tapety pro TV</h1>
<p>Fotka se ořízne na 1920×1080 a ztmaví, aby byly čitelné hodiny a dlaždice. Televize si seznam načte při příštím otevření plochy.</p>
{message}
<form class="up" method="post" action="upload" enctype="multipart/form-data">
<input type="file" name="photo" accept="image/*,.heic" multiple required>
<input type="text" name="title" placeholder="Název (nepovinné)">
<button>Nahrát</button>
</form>
<div class="grid">{cards}</div>
</html>"""

CARD = """<div class="card"><img src="img/{key}.jpg" loading="lazy" alt="">
<div><span>{title}</span><form method="post" action="delete" onsubmit="return confirm('Smazat?')">
<input type="hidden" name="key" value="{key}"><button>Smazat</button></form></div></div>"""


class Handler(BaseHTTPRequestHandler):
    def send(self, status, body, ctype, extra=None):
        self.send_response(status)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def page(self, message=''):
        cards = ''.join(CARD.format(key=w['key'], title=html.escape(w['title'])) for w in reversed(load()))
        body = PAGE.format(message=message, cards=cards).encode('utf-8')
        self.send(200, body, 'text/html; charset=utf-8')

    def back(self):
        self.send(303, b'', 'text/plain', {'Location': './'})

    def do_GET(self):
        p = self.path.split('?')[0]
        if p in ('/', '/index.html'):
            return self.page()
        if p == '/list.json':
            items = [{'key': w['key'], 'title': w['title'], 'file': 'img/%s.jpg' % w['key'],
                      'thumb': 'thumbs/%s.jpg' % w['key']} for w in load()]
            body = json.dumps({'wallpapers': items}, ensure_ascii=False).encode('utf-8')
            return self.send(200, body, 'application/json; charset=utf-8', {'Cache-Control': 'no-cache'})
        m = re.match(r'^/(img|thumbs)/(nas-[a-z0-9-]+)\.jpg$', p)
        if m and os.path.exists(path(m.group(1), m.group(2) + '.jpg')):
            with open(path(m.group(1), m.group(2) + '.jpg'), 'rb') as f:
                return self.send(200, f.read(), 'image/jpeg', {'Cache-Control': 'max-age=31536000, immutable'})
        self.send(404, b'Not found', 'text/plain')

    def form(self):
        length = int(self.headers.get('Content-Length') or 0)
        if length > MAX_UPLOAD:
            raise ValueError('Soubor je příliš velký')
        raw = self.rfile.read(length)
        ctype = self.headers.get('Content-Type', '')
        if ctype.startswith('application/x-www-form-urlencoded'):
            from urllib.parse import parse_qs
            return [(k, None, v[0].encode()) for k, v in parse_qs(raw.decode()).items()]
        msg = BytesParser(policy=HTTP).parsebytes(b'Content-Type: ' + ctype.encode() + b'\r\n\r\n' + raw)
        return [(part.get_param('name', header='content-disposition'), part.get_filename(),
                 part.get_payload(decode=True)) for part in msg.iter_parts()]

    def do_POST(self):
        try:
            fields = self.form()
            if self.path == '/upload':
                title = next((v.decode('utf-8').strip() for n, f, v in fields if n == 'title'), '')
                photos = [(f, v) for n, f, v in fields if n == 'photo' and f and v]
                for filename, data in photos:
                    add_photo(filename, data, title if len(photos) == 1 else '')
                return self.back()
            if self.path == '/delete':
                key = next((v.decode() for n, f, v in fields if n == 'key'), '')
                delete_photo(key)
                return self.back()
            self.send(404, b'Not found', 'text/plain')
        except Exception as e:  # show it on the page rather than dropping the connection
            self.page('<p class="msg">Chyba: %s</p>' % html.escape(str(e)))


if __name__ == '__main__':
    print('Serving wallpapers from %s on port %d' % (DATA, PORT), flush=True)
    ThreadingHTTPServer(('', PORT), Handler).serve_forever()
