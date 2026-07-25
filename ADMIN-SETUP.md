# Dashboard setup

Your site now has a password-protected dashboard at `/admin.html` for
adding, editing, reordering, and deleting Projects and Testimonials —
no code required.

## 1. First login

Open `yoursite.com/admin.html`. The first time you visit, it'll ask you
to set a password (this is stored, hashed, in your browser only — not
sent anywhere). From then on, that password unlocks the dashboard on
that browser/device.

## 2. Editing content

- **Projects tab / Testimonials tab** — click **+ Add**, or click the
  pencil icon on any card to edit it, or the trash icon to delete it.
  Use the up/down arrows to reorder.
- Every change is auto-saved as a local draft the moment you make it —
  you won't lose work by closing the tab.
- A draft only lives in **your** browser until you publish it (next
  step) — it won't show up for site visitors on its own.

## 3. Publishing changes live

Because this is a static site (no server/database), "going live" means
updating the `assets/data/content.json` file your live site reads from.
Two ways to do that, both under the **Publish & Settings** tab:

### Option A — Publish to GitHub (recommended, since your site is on GitHub)

1. Create a **fine-grained personal access token** at
   github.com → Settings → Developer settings → Personal access tokens
   → Fine-grained tokens. Scope it to just this one repository, with
   **Contents: Read and write** permission.
2. In the dashboard, fill in your GitHub username, repo name, branch
   (usually `main`), and paste the token in. Click **Save connection**.
3. Click **Publish live**. This commits the updated `content.json`
   straight to your repo. Your host (GitHub Pages or similar) will
   rebuild automatically — changes usually go live within about a
   minute.

The token is stored only in that browser's local storage and is only
ever sent to GitHub's API — nowhere else.

### Option B — Manual export (works with any host)

Click **Download content.json**, then replace
`assets/data/content.json` in your project with the downloaded file
and redeploy however you normally do.

## A note on the password

The dashboard's password check runs entirely in the browser (there's
no server to check it against). That's enough to keep casual visitors
out of your editing tool, but it isn't the same as real server-side
authentication — don't use it to protect anything more sensitive than
"please don't mess with my portfolio content."
