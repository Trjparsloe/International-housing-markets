# Adding or swapping photos

The site only hosts resized copies of photos. Full-size originals live **outside the repo** in `Documents/IHM-photo-originals/<Folder>/`, so they never bloat git.

1. Drop the new photo into `images/<Folder>/` and add it to the page inside a `<figure>` as usual:
   `<img src="images/<Folder>/my photo.jpg" alt="...">`
2. From the site folder, preview and then run:
   ```
   python tools/make_web_images.py <Page>.html <Folder> --dry-run
   python tools/make_web_images.py <Page>.html <Folder>
   ```
   For any photo over 2000px, it makes `web/<slug>-1000.jpg`, `-2000.jpg` (page) and `-3000.jpg` (lightbox zoom). It then rewrites the `<img>` and moves the original to `IHM-photo-originals/<Folder>/` after checking the copy.
3. Commit the page plus the new `images/<Folder>/web/` files together.

If the script prints a **WARNING: files over 2 MB**, don't commit those files. Run the script on them, or move them to the originals folder.

Page → image folder: Germany → `Berlin`, Japan → `Japan`, Oman → `Oman`, Korea → `Korea`, Ireland → `Ireland`, Italy → `Italy`.

Keep `IHM-photo-originals` backed up (OneDrive, Google Photos or an external drive). It's the only copy of the full-size photos. `_from-git-history/` inside it holds older versions recovered from git when the history was cleaned on 5 Nov 2026.
