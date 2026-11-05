"""Make web-sized copies of a page's photos, point the page at them, and move
the big original out of the repo.

Why: camera originals (4000-5500px, 5-15 MB each) look glittery when the
browser shrinks them, make pages slow, and bloat the git repo. The site only
ever serves resized copies; originals live in a folder OUTSIDE the repo:

    Documents/IHM-photo-originals/<Folder>/<original file>

For every photo inside a <figure> whose long edge is over 2000px:
    images/<Folder>/web/<slug>-1000.jpg  and  -2000.jpg  -> page (srcset)
    images/<Folder>/web/<slug>-3000.jpg                  -> lightbox zoom (data-full)
then the original is MOVED to IHM-photo-originals/<Folder>/ (checked first).

Photos with a long edge of 2000px or less are left alone and stay in the repo.
Photos that already have a srcset are skipped, so it is safe to re-run.

Typical use after adding photos to a page (run from the site folder):
    python tools/make_web_images.py Korea.html Korea --dry-run   # preview
    python tools/make_web_images.py Korea.html Korea             # do it
Then commit the page and the new images/<Folder>/web/ files together.

Options:
    --dry-run     show what would happen, change nothing
    --keep        make copies and update the page, but don't move originals
At the end it also warns about any file in images/ over 2 MB that isn't a
web copy, since those would bloat the repo if committed.
"""
import os, re, sys, html, shutil, hashlib
from PIL import Image, ImageOps

args = [a for a in sys.argv[1:] if not a.startswith('--')]
DRY = '--dry-run' in sys.argv
KEEP = '--keep' in sys.argv
if len(args) != 2:
    sys.exit(__doc__)
page, folder = args
root = os.getcwd()
img_dir = os.path.join(root, 'images', folder)
web_dir = os.path.join(img_dir, 'web')
archive_dir = os.path.join(os.path.dirname(root), 'IHM-photo-originals', folder)
PAGE_SIZES = (1000, 2000)  # long-edge sizes used on the page
ZOOM_SIZE = 3000           # long-edge size used by the lightbox zoom
MIN_LONG_EDGE = 2000       # only convert images bigger than this
WARN_BYTES = 2_000_000

def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', os.path.splitext(name)[0].lower()).strip('-')

def sha1(path):
    h = hashlib.sha1()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()

def make(orig):
    im = ImageOps.exif_transpose(Image.open(os.path.join(img_dir, orig))).convert('RGB')
    long_edge = max(im.size)
    out = {}
    for target in PAGE_SIZES + (ZOOM_SIZE,):
        s = min(target, long_edge) / long_edge
        size = (round(im.width * s), round(im.height * s))
        name = f'{slug(orig)}-{target}.jpg'
        dst = os.path.join(web_dir, name)
        if not DRY and not os.path.exists(dst):
            os.makedirs(web_dir, exist_ok=True)
            im.resize(size, Image.LANCZOS).save(dst, 'JPEG', quality=82, optimize=True, progressive=True)
        out[target] = (f'images/{folder}/web/{name}', size[0])
    return out

def archive(orig):
    """Copy the original to the archive, verify it, then remove it from the repo."""
    src = os.path.join(img_dir, orig)
    dst = os.path.join(archive_dir, orig)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if os.path.exists(dst) and sha1(dst) != sha1(src):
        base, ext = os.path.splitext(dst)
        dst = f'{base} (2){ext}'
    if not os.path.exists(dst):
        shutil.copy2(src, dst)
    if sha1(dst) != sha1(src):
        return f'NOT moved, archive copy did not verify: {orig}'
    os.remove(src)
    return None

raw = open(page, 'rb').read().decode('utf-8')
crlf = '\r\n' in raw
src = raw.replace('\r\n', '\n')

# a <figure ...> opening tag, then (possibly across lines) its first <img ...> tag
fig_re = re.compile(r'(<figure\b([^>]*)>\s*)(<img\b[^>]*>)', re.S)
converted, skipped, to_archive = [], [], []

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
    v = make(orig)
    sizes = '(max-width: 768px) 90vw, 1200px' if 'full-row' in cls else '(max-width: 768px) 90vw, 580px'
    srcset = ', '.join(f'{v[t][0]} {v[t][1]}w' for t in PAGE_SIZES)
    new_tag = tag.replace(sm.group(0),
        f'src="{v[PAGE_SIZES[0]][0]}" srcset="{srcset}" sizes="{sizes}" data-full="{v[ZOOM_SIZE][0]}"', 1)
    converted.append((orig, f'{w}x{h}'))
    to_archive.append(orig)
    return lead + new_tag

new = fig_re.sub(repl, src)
problems = []
if not DRY:
    if crlf:
        new = new.replace('\n', '\r\n')
    open(page, 'wb').write(new.encode('utf-8'))
    if not KEEP:
        for orig in to_archive:
            err = archive(orig)
            if err:
                problems.append(err)

print(('DRY RUN - nothing written\n' if DRY else '') + f'Converted {len(converted)}:')
for o, s in converted: print('   ', s, o)
print(f'Left alone {len(skipped)}:')
for o, r in skipped: print('   ', r, '-', o)
if converted and not KEEP:
    print(('Would move' if DRY else 'Moved'), f'{len(to_archive) - len(problems)} original(s) to {archive_dir}')
for p in problems: print('  !!', p)
if not DRY and os.path.isdir(web_dir):
    total = sum(os.path.getsize(os.path.join(web_dir, f)) for f in os.listdir(web_dir))
    print(f'web folder now {total/1048576:.1f} MB')

# Warn about big files that would bloat the repo if committed
big = []
for r, _, files in os.walk(os.path.join(root, 'images')):
    if os.path.basename(r) == 'web':
        continue
    for f in files:
        p = os.path.join(r, f)
        if os.path.getsize(p) > WARN_BYTES and not f.lower().endswith(('.mp4', '.webm', '.mov')):
            big.append((os.path.getsize(p), os.path.relpath(p, root)))
if big:
    print('\nWARNING: files over 2 MB in images/ (keep these out of git):')
    for s, p in sorted(big, reverse=True):
        print(f'   {s/1e6:5.1f} MB  {p}')
