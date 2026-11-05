# Paste this into a new chat

---

I want to make web-sized copies of the photos on the other country pages of my International Housing Markets website, the same way we did for Ireland.

**Context**

- The site is a static HTML site in my connected Documents folder at `International-housing-markets` (git repo, pushed to GitHub, edited in VS Code).
- On the Ireland page, large camera originals were being shrunk about 10x by the browser, which made them look glittery and pixellated and made the page very heavy. We fixed it with a script that's already in the repo: `tools/make_web_images.py`. Read the docstring at the top before running it.
- What the script does: for every photo inside a `<figure>`, if its long edge is over 2000px, it makes two smoothly resized copies (1000px and 2000px long edge) in `images/<Folder>/web/`, then updates the page's `<img>` to use them via `srcset`, with `data-full` pointing at the untouched original. Smaller images are left alone. Originals are never modified, moved or deleted. It's safe to re-run, because it skips anything already converted.
- `lightbox.js` (shared by all pages) already reads `data-full` for the full-screen zoom, so no JavaScript changes are needed.

**Pages and image folders** (the folder name isn't always the page name)

| Page | Image folder | Expected from a dry run |
|---|---|---|
| Korea.html | Korea | 17 to convert (the main one, all 4000x3000 phone shots) |
| Germany.html | Berlin | 3 to convert |
| Japan.html | Japan | 4 to convert |
| Oman.html | Oman | 2 to convert (one is an 8192px Google Earth .webp) |
| Italy.html | Italy | nothing needed |

**Please**

1. For each page, run a dry run first from the site folder and show me what it would convert, e.g. `python tools/make_web_images.py Korea.html Korea --dry-run`.
2. Once I say go, run it for real without `--dry-run`, one page at a time.
3. After each page, check that the text and captions are unchanged (only the `<img>` tags should differ), that the file's CRLF line endings are preserved, and that every new `src`/`srcset` file exists.
4. Show me a screenshot of each page so I can check the photos look right, especially that portraits are the right way up.
5. Tell me the total size of each new `web/` folder, and remind me to commit those folders when I push.

**Things to watch**

- The files use CRLF line endings, and the script preserves them. If you edit HTML by hand, keep them.
- Don't run plain `git status`/`git diff` from the sandbox. It leaves a stale `.git/index.lock` that breaks git in VS Code. Use `git --no-optional-locks ...`, and if a lock file appears, delete it.
- `git status` shows almost every file as modified because of file-mode and line-ending noise. Real changes show with `git --no-optional-locks -c core.fileMode=false diff --stat --ignore-cr-at-eol`.
- Don't change captions, image choices or layout. This job is only about image sizes.

---

## For future photo changes (any page)

After adding or swapping photos on a page, run:

```
python tools/make_web_images.py <Page>.html <ImageFolder>
```

It only converts photos that don't have web copies yet. Then commit the page, the new photos and the `images/<Folder>/web/` folder together.
