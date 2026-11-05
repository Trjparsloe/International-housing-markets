"""Make web-sized copies of a page's article images and point the page at them.

Why: large camera originals (e.g. 5472px) shrunk ~10x by the browser look
glittery/aliased and make pages huge. This creates smoothly resized copies:

  article view   -> images/<Folder>/web/<slug>-1000.jpg and -2000.jpg (srcset)
  lightbox zoom  -> data-full="<untouched original>"

Only images inside <figure> are touched. Images whose long edge is already
<= 2000px are left alone (no benefit). Images that already have a srcset are
skipped, so it is safe to re-run after adding or swapping photos.
Originals are never modified, moved or deleted.

Usage (from the site folder):
  python tools/make_web_images.py Ireland.html Ireland            # do it
  python tools/make_web_images.py Germany.html Berlin --dry-run   # preview only
"""
import os, re, sys, html
from PIL import Image, ImageOps

args = [a for a in sys.argv[1:] if not a.startswith('--')]
DRY = '--dry-run' in sys.argv
page, folder = args[0], args[1]
root = os.getcwd()
img_dir = os.path.join(root, 'images', folder)
web_dir = os.path.join(img_dir, 'web')
WIDTHS = (1000, 2000)   # long-edge sizes generated
MIN_LONG_EDGE = 2000    # only convert images bigger than this

def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', os.path.splitext(name)[0].lower()).strip('-')

def make(orig):
    im = ImageOps.exif_transpose(Image.open(os.path.join(img_dir, orig))).convert('RGB')
    long_edge = max(im.size)
    out = []
    for target in WIDTHS:
        t = min(target, long_edge)
        s = t / long_edge
        size = (round(im.width * s), round(im.height * s))
        name = f'{slug(orig)}-{target}.jpg'
        dst = os.path.join(web_dir, name)
        if not DRY and not os.path.exists(dst):
            os.makedirs(web_dir, exist_ok=True)
            im.resize(size, Image.LANCZOS).save(dst, 'JPEG', quality=82, optimize=True, progressive=True)
        out.append((f'images/{folder}/web/{name}', size[0]))
    return out

raw = open(page, 'rb').read().decode('utf-8')
crlf = '\r\n' in raw
src = raw.replace('\r\n', '\n')

# a <figure ...> opening tag, then (possibly across lines) its first <img ...> tag
fig_re = re.compile(r'(<figure\b([^>]*)>\s*)(<img\b[^>]*>)', re.S)
converted, skipped = [], []

def repl(m):
    lead, attrs, tag = m.group(1), m.group(2), m.group(3)
    cm = re.search(r'class="([^"]*)"', attrs)
    cls = cm.group(1) if cm else ''
    sm = re.search(r'\bsrc="images/' + re.escape(folder) + r'/([^"]+)"', tag)
    if not sm or 'srcset=' in tag:
        return m.group(0)
    orig_attr = sm.group(1)
    orig = html.unescape(orig_attr)
    path = os.path.join(img_dir, orig)
    if not os.path.exists(path):
        skipped.append((orig, 'file missing')); return m.group(0)
    try:
        w, h = ImageOps.exif_transpose(Image.open(path)).size
    except Exception as e:
        skipped.append((orig, f'unreadable: {e}')); return m.group(0)
    if max(w, h) <= MIN_LONG_EDGE:
        skipped.append((orig, f'already small ({w}x{h})')); return m.group(0)
    versions = make(orig)
    sizes = '(max-width: 768px) 90vw, 1200px' if 'full-row' in cls else '(max-width: 768px) 90vw, 580px'
    srcset = ', '.join(f'{p} {pw}w' for p, pw in versions)
    new_tag = tag.replace(sm.group(0),
        f'src="{versions[0][0]}" srcset="{srcset}" sizes="{sizes}" data-full="images/{folder}/{orig_attr}"', 1)
    converted.append((orig, f'{w}x{h}'))
    return lead + new_tag

new = fig_re.sub(repl, src)
if not DRY:
    if crlf:
        new = new.replace('\n', '\r\n')
    open(page, 'wb').write(new.encode('utf-8'))

print(('DRY RUN - nothing written\n' if DRY else '') + f'Converted {len(converted)}:')
for o, s in converted: print('   ', s, o)
print(f'Left alone {len(skipped)}:')
for o, r in skipped: print('   ', r, '-', o)
if not DRY and os.path.isdir(web_dir):
    total = sum(os.path.getsize(os.path.join(web_dir, f)) for f in os.listdir(web_dir))
    print(f'web folder now {total/1048576:.1f} MB')
