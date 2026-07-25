# Dashboard setup

Your site now has a password-protected dashboard at `/admin.html` for
adding, editing, reordering, and deleting Projects and Testimonials —
no code required.

## 1. First login

Open `yoursite.com/admin.html`. The first time anyone visits, it'll ask
you to set a password. That password is hashed and saved as part of
your site's content — the same `content.json` file your Projects and
Testimonials live in — so once you **publish** (step 3), that one
password works from any browser or device that loads the live site.
Until you publish it, it only works on the device you set it on.

Changing the password later (Publish & Settings tab) works the same
way — the change is a local draft until you publish it.

## 2. Editing content

- **Projects tab / Testimonials tab** — click **+ Add**, or click the
  pencil icon on any card to edit it, or the trash icon to delete it.
  Use the up/down arrows to reorder.
- For an image or avatar, choose **Image URL** to link to an existing
  image, or **Upload image** to pick a file from your device — it's
  resized and embedded directly into `content.json`, so it publishes
  along with everything else with no separate image host needed. Keep
  uploads modest in size (the dashboard will warn you if things get
  large); for big hero images, an external URL is lighter-weight.
- Every change is auto-saved as a local draft the moment you make it —
  you won't lose work by closing the tab.
- A draft only lives in **your** browser until you publish it (next
  step) — it won't show up for site visitors, or other devices, on
  its own. That includes password changes.

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
no server to check it against). The password itself is never stored —
only its SHA-256 hash is, and that hash now lives inside your
published `content.json`, the same public file your projects and
testimonials are already in. That's enough to keep casual visitors out
of your editing tool, but since the hash is technically public (anyone
who inspects your site's files can see it, the same way they could
already see your content), it isn't the same as real server-side
authentication — don't use it to protect anything more sensitive than
"please don't mess with my portfolio content," and don't reuse a
password you use anywhere else.
