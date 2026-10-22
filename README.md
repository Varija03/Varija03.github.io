# Varija Manglik — personal website

Everything is in one flat folder: no subfolders, so you can drag all the files into GitHub in one go.

## Put it online
1. Your repo name must be exactly `<your-username>.github.io`.
2. In the repo, click **Add file → Upload files**, drag in **every file** from this folder, then **Commit changes**.
3. **Add file → Create new file**, name it `.pages.yml`, paste in everything from `pages.yml.txt`, **Commit changes**.
4. **Settings → Pages →** Deploy from a branch, **main**, **/ (root)**, **Save**.

## Edit the site anytime
Go to app.pagescms.org, sign in with GitHub, pick the repo, edit, Save. Uploaded images and PDFs go into an `uploads` folder the editor creates for you.

Files: `*.json` = your content. `index.html`, `style.css`, `app.js`, `scene3d.js` = design and 3D. `three.module.min.js`, `RoomEnvironment.js` = the three.js 3D library (MIT license, see THREE-LICENSE.txt).
