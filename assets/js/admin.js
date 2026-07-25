/* ==========================
   Admin Dashboard logic
   No build step, no framework — vanilla JS matching the site's theme.
========================== */

/* ---------------- THEME (matches main site) ---------------- */
(function(){
    const root = document.documentElement;
    const toggle = document.getElementById('themeToggleAdmin');
    function setTheme(dark){ root.classList.toggle('dark', dark); }
    setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
    toggle.addEventListener('click', () => setTheme(!root.classList.contains('dark')));
})();

/* ---------------- STORAGE KEYS ---------------- */
const LS_PW_HASH   = "jdw_admin_pw_hash";
const LS_DRAFT      = "jdw_content_draft";
const LS_GH_SETTINGS = "jdw_admin_github";
const SS_AUTH        = "jdw_admin_session";
const CONTENT_URL    = "/assets/data/content.json";

/* ---------------- HELPERS ---------------- */
async function sha256(text){
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function toast(icon, title, text){
    Swal.fire({ icon, title, text, confirmButtonText: "Got it" });
}

function toastQuick(icon, title){
    Swal.fire({
        icon, title, toast: true, position: "top-end", showConfirmButton: false,
        timer: 2200, timerProgressBar: true
    });
}

function confirmAction(title, text){
    return Swal.fire({
        icon: "warning", title, text,
        showCancelButton: true, confirmButtonText: "Delete", cancelButtonText: "Cancel",
        confirmButtonColor: "#FF5A3C"
    }).then(r => r.isConfirmed);
}

function escapeHtml(str){
    return (str || "").replace(/[&<>"']/g, m => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[m]));
}

function slugify(str){
    return (str || "project").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"") || "project";
}

/* ==========================
   AUTH
========================== */
const loginScreen   = document.getElementById("loginScreen");
const dashboardEl   = document.getElementById("dashboard");
const loginForm     = document.getElementById("loginForm");
const pwInput       = document.getElementById("pwInput");
const pwConfirmField = document.getElementById("pwConfirmField");
const pwConfirmInput = document.getElementById("pwConfirmInput");
const loginSub       = document.getElementById("loginSub");
const loginSubmit    = document.getElementById("loginSubmit");
const loginError     = document.getElementById("loginError");

function showLoginError(msg){
    loginError.textContent = msg;
    loginError.classList.add("is-visible");
}
function clearLoginError(){
    loginError.classList.remove("is-visible");
}

function isFirstRun(){
    return !localStorage.getItem(LS_PW_HASH);
}

function renderLoginMode(){
    if (isFirstRun()){
        loginSub.textContent = "First time here — set a password to protect this dashboard.";
        pwConfirmField.style.display = "block";
        pwConfirmInput.required = true;
        loginSubmit.textContent = "Set password & continue →";
    } else {
        loginSub.textContent = "Enter your password to manage projects and testimonials.";
        pwConfirmField.style.display = "none";
        pwConfirmInput.required = false;
        loginSubmit.textContent = "Unlock dashboard →";
    }
}

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearLoginError();

    if (isFirstRun()){
        const pw = pwInput.value;
        const confirm = pwConfirmInput.value;
        if (pw.length < 4){
            showLoginError("Password should be at least 4 characters.");
            return;
        }
        if (pw !== confirm){
            showLoginError("Passwords don't match.");
            return;
        }
        localStorage.setItem(LS_PW_HASH, await sha256(pw));
        sessionStorage.setItem(SS_AUTH, "1");
        enterDashboard();
        return;
    }

    const hash = await sha256(pwInput.value);
    if (hash === localStorage.getItem(LS_PW_HASH)){
        sessionStorage.setItem(SS_AUTH, "1");
        enterDashboard();
    } else {
        showLoginError("Incorrect password.");
    }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem(SS_AUTH);
    dashboardEl.style.display = "none";
    loginScreen.style.display = "flex";
    pwInput.value = "";
    renderLoginMode();
});

/* ==========================
   CONTENT STATE
========================== */
let state = { projects: [], testimonials: [] };

async function loadState(){
    const draft = localStorage.getItem(LS_DRAFT);
    if (draft){
        try {
            state = JSON.parse(draft);
            return;
        } catch(e){ /* fall through to fetch */ }
    }

    try {
        const res = await fetch(CONTENT_URL, { cache: "no-store" });
        if (res.ok){
            state = await res.json();
        }
    } catch(e){
        state = { projects: [], testimonials: [] };
    }
    saveDraft();
}

function saveDraft(){
    localStorage.setItem(LS_DRAFT, JSON.stringify(state));
    const pillText = document.getElementById("draftPillText");
    if (pillText) pillText.textContent = "Saved locally — publish to go live";
}

/* ==========================
   RENDER: PROJECTS
========================== */
const projectsGrid = document.getElementById("projectsGrid");
const projectsCount = document.getElementById("projectsCount");

function renderProjectsAdmin(){
    projectsGrid.innerHTML = "";
    projectsCount.textContent = state.projects.length;

    state.projects.forEach((p, i) => {
        const card = document.createElement("div");
        card.className = "admin-item-card";
        card.innerHTML = `
            <div class="admin-item-order">
                <button class="up-btn" title="Move up" ${i === 0 ? "disabled style='opacity:.3'" : ""}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 15l-6-6-6 6"/></svg>
                </button>
                <button class="down-btn" title="Move down" ${i === state.projects.length - 1 ? "disabled style='opacity:.3'" : ""}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
                </button>
            </div>
            <div class="admin-item-actions">
                <button class="edit-btn" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="delete-btn" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                </button>
            </div>
            <div class="admin-item-media">
                ${p.nda ? '<span class="project-nda" style="position:absolute;top:12px;right:12px;">NDA</span>' : ''}
                <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" loading="lazy">
            </div>
            <div class="admin-item-body">
                <h3>${escapeHtml(p.title)}</h3>
                <p>${escapeHtml(p.description)}</p>
                <div class="admin-item-tags">
                    ${(p.tags||[]).map(t => `<span>${escapeHtml(t)}</span>`).join("")}
                </div>
            </div>
        `;
        card.querySelector(".edit-btn").addEventListener("click", () => openProjectModal(i));
        card.querySelector(".delete-btn").addEventListener("click", () => deleteProject(i));
        const upBtn = card.querySelector(".up-btn");
        const downBtn = card.querySelector(".down-btn");
        if (i > 0) upBtn.addEventListener("click", () => moveItem("projects", i, -1));
        if (i < state.projects.length - 1) downBtn.addEventListener("click", () => moveItem("projects", i, 1));
        projectsGrid.appendChild(card);
    });

    const addCard = document.createElement("button");
    addCard.className = "admin-add-card";
    addCard.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        Add a project
    `;
    addCard.addEventListener("click", () => openProjectModal(null));
    projectsGrid.appendChild(addCard);
}

function moveItem(key, index, dir){
    const arr = state[key];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    saveDraft();
    key === "projects" ? renderProjectsAdmin() : renderTestimonialsAdmin();
}

function deleteProject(i){
    confirmAction("Delete this project?", state.projects[i].title).then(ok => {
        if (!ok) return;
        state.projects.splice(i, 1);
        saveDraft();
        renderProjectsAdmin();
        toastQuick("success", "Project deleted");
    });
}

/* ---------------- PROJECT MODAL ---------------- */
const projectModalOverlay2 = document.getElementById("projectModalOverlay2");
const projectModalHeading  = document.getElementById("projectModalHeading");
const projectModalFile     = document.getElementById("projectModalFile");
const pTitle = document.getElementById("pTitle");
const pImage = document.getElementById("pImage");
const pImagePreview = document.getElementById("pImagePreview");
const pDescription = document.getElementById("pDescription");
const pLink = document.getElementById("pLink");
const pNdaSwitch = document.getElementById("pNdaSwitch");
const pTagsInput = document.getElementById("pTagsInput");
const pTagsWrap = document.getElementById("pTagsWrap");
const pDeleteBtn = document.getElementById("pDeleteBtn");

let editingProjectIndex = null;
let currentTags = [];

function renderTagChips(){
    pTagsWrap.querySelectorAll(".tag-chip").forEach(el => el.remove());
    currentTags.forEach((tag, idx) => {
        const chip = document.createElement("span");
        chip.className = "tag-chip";
        chip.innerHTML = `${escapeHtml(tag)} <button type="button" aria-label="Remove tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`;
        chip.querySelector("button").addEventListener("click", () => {
            currentTags.splice(idx, 1);
            renderTagChips();
        });
        pTagsWrap.insertBefore(chip, pTagsInput);
    });
}

pTagsInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === ","){
        e.preventDefault();
        const val = pTagsInput.value.trim();
        if (val && !currentTags.includes(val)){
            currentTags.push(val);
            renderTagChips();
        }
        pTagsInput.value = "";
    } else if (e.key === "Backspace" && !pTagsInput.value){
        currentTags.pop();
        renderTagChips();
    }
});

pImage.addEventListener("input", () => {
    if (pImage.value.trim()){
        pImagePreview.src = pImage.value.trim();
        pImagePreview.style.display = "block";
    } else {
        pImagePreview.style.display = "none";
    }
});

function setSwitch(el, on){
    el.classList.toggle("is-on", !!on);
    el.dataset.on = on ? "1" : "0";
}
pNdaSwitch.addEventListener("click", () => setSwitch(pNdaSwitch, pNdaSwitch.dataset.on !== "1"));

function openProjectModal(index){
    editingProjectIndex = index;
    const isNew = index === null;
    const p = isNew ? { title:"", image:"", description:"", tags:[], link:"", nda:false } : state.projects[index];

    projectModalHeading.textContent = isNew ? "Add project" : "Edit project";
    projectModalFile.textContent = isNew ? "new-project.md" : slugify(p.title) + ".md";
    pTitle.value = p.title || "";
    pImage.value = p.image || "";
    if (p.image){
        pImagePreview.src = p.image;
        pImagePreview.style.display = "block";
    } else {
        pImagePreview.removeAttribute("src");
        pImagePreview.style.display = "none";
    }
    pDescription.value = p.description || "";
    pLink.value = p.link || "";
    currentTags = [...(p.tags || [])];
    renderTagChips();
    setSwitch(pNdaSwitch, p.nda);
    pDeleteBtn.style.display = isNew ? "none" : "inline-flex";

    projectModalOverlay2.classList.add("is-open");
    setTimeout(() => pTitle.focus(), 100);
}

function closeProjectModal(){
    projectModalOverlay2.classList.remove("is-open");
}

document.getElementById("projectModalClose").addEventListener("click", closeProjectModal);
document.getElementById("pCancelBtn").addEventListener("click", closeProjectModal);
projectModalOverlay2.addEventListener("click", (e) => { if (e.target === projectModalOverlay2) closeProjectModal(); });

document.getElementById("pSaveBtn").addEventListener("click", () => {
    const title = pTitle.value.trim();
    const image = pImage.value.trim();
    const description = pDescription.value.trim();

    if (!title || !image || !description){
        toast("warning", "Missing details", "Title, image URL, and description are required.");
        return;
    }

    const projectObj = {
        title, image, description,
        tags: [...currentTags],
        link: pLink.value.trim(),
        nda: pNdaSwitch.dataset.on === "1"
    };

    if (editingProjectIndex === null){
        state.projects.push(projectObj);
    } else {
        state.projects[editingProjectIndex] = projectObj;
    }

    saveDraft();
    renderProjectsAdmin();
    closeProjectModal();
    toastQuick("success", editingProjectIndex === null ? "Project added" : "Project updated");
});

pDeleteBtn.addEventListener("click", () => {
    if (editingProjectIndex === null) return;
    confirmAction("Delete this project?", state.projects[editingProjectIndex].title).then(ok => {
        if (!ok) return;
        state.projects.splice(editingProjectIndex, 1);
        saveDraft();
        renderProjectsAdmin();
        closeProjectModal();
        toastQuick("success", "Project deleted");
    });
});

document.getElementById("addProjectBtn").addEventListener("click", () => openProjectModal(null));

/* ==========================
   RENDER: TESTIMONIALS
========================== */
const testimonialsGridAdmin = document.getElementById("testimonialsGridAdmin");
const testimonialsCount = document.getElementById("testimonialsCount");

function renderTestimonialsAdmin(){
    testimonialsGridAdmin.innerHTML = "";
    testimonialsCount.textContent = state.testimonials.length;

    state.testimonials.forEach((t, i) => {
        const card = document.createElement("div");
        card.className = "admin-item-card admin-testi-card";
        card.innerHTML = `
            <div class="admin-item-order">
                <button class="up-btn" title="Move up" ${i === 0 ? "disabled style='opacity:.3'" : ""}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 15l-6-6-6 6"/></svg>
                </button>
                <button class="down-btn" title="Move down" ${i === state.testimonials.length - 1 ? "disabled style='opacity:.3'" : ""}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
                </button>
            </div>
            <div class="admin-item-actions">
                <button class="edit-btn" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="delete-btn" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                </button>
            </div>
            <div class="admin-item-body">
                <p>"${escapeHtml(t.quote)}"</p>
                <div class="admin-testi-who">
                    <div class="admin-testi-avatar"><img src="${escapeHtml(t.avatar)}" alt="${escapeHtml(t.name)}" loading="lazy"></div>
                    <div>
                        <b>${escapeHtml(t.name)}</b>
                        <span>${escapeHtml(t.role)}</span>
                    </div>
                </div>
            </div>
        `;
        card.querySelector(".edit-btn").addEventListener("click", () => openTestimonialModal(i));
        card.querySelector(".delete-btn").addEventListener("click", () => deleteTestimonial(i));
        const upBtn = card.querySelector(".up-btn");
        const downBtn = card.querySelector(".down-btn");
        if (i > 0) upBtn.addEventListener("click", () => moveItem("testimonials", i, -1));
        if (i < state.testimonials.length - 1) downBtn.addEventListener("click", () => moveItem("testimonials", i, 1));
        testimonialsGridAdmin.appendChild(card);
    });

    const addCard = document.createElement("button");
    addCard.className = "admin-add-card";
    addCard.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        Add a testimonial
    `;
    addCard.addEventListener("click", () => openTestimonialModal(null));
    testimonialsGridAdmin.appendChild(addCard);
}

function deleteTestimonial(i){
    confirmAction("Delete this testimonial?", state.testimonials[i].name).then(ok => {
        if (!ok) return;
        state.testimonials.splice(i, 1);
        saveDraft();
        renderTestimonialsAdmin();
        toastQuick("success", "Testimonial deleted");
    });
}

/* ---------------- TESTIMONIAL MODAL ---------------- */
const testimonialModalOverlay = document.getElementById("testimonialModalOverlay");
const testiModalHeading = document.getElementById("testiModalHeading");
const tName = document.getElementById("tName");
const tRole = document.getElementById("tRole");
const tAvatar = document.getElementById("tAvatar");
const tQuote = document.getElementById("tQuote");
const tDeleteBtn = document.getElementById("tDeleteBtn");

let editingTestimonialIndex = null;

function openTestimonialModal(index){
    editingTestimonialIndex = index;
    const isNew = index === null;
    const t = isNew ? { name:"", role:"", avatar:"", quote:"" } : state.testimonials[index];

    testiModalHeading.textContent = isNew ? "Add testimonial" : "Edit testimonial";
    tName.value = t.name || "";
    tRole.value = t.role || "";
    tAvatar.value = t.avatar || "";
    tQuote.value = t.quote || "";
    tDeleteBtn.style.display = isNew ? "none" : "inline-flex";

    testimonialModalOverlay.classList.add("is-open");
    setTimeout(() => tName.focus(), 100);
}

function closeTestimonialModal(){
    testimonialModalOverlay.classList.remove("is-open");
}

document.getElementById("testiModalClose").addEventListener("click", closeTestimonialModal);
document.getElementById("tCancelBtn").addEventListener("click", closeTestimonialModal);
testimonialModalOverlay.addEventListener("click", (e) => { if (e.target === testimonialModalOverlay) closeTestimonialModal(); });

document.getElementById("addTestimonialBtn").addEventListener("click", () => openTestimonialModal(null));

document.getElementById("tSaveBtn").addEventListener("click", () => {
    const name = tName.value.trim();
    const role = tRole.value.trim();
    const quote = tQuote.value.trim();

    if (!name || !role || !quote){
        toast("warning", "Missing details", "Name, role, and quote are required.");
        return;
    }

    const testimonialObj = {
        name, role, quote,
        avatar: tAvatar.value.trim() || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(slugify(name))}`
    };

    if (editingTestimonialIndex === null){
        state.testimonials.push(testimonialObj);
    } else {
        state.testimonials[editingTestimonialIndex] = testimonialObj;
    }

    saveDraft();
    renderTestimonialsAdmin();
    closeTestimonialModal();
    toastQuick("success", editingTestimonialIndex === null ? "Testimonial added" : "Testimonial updated");
});

tDeleteBtn.addEventListener("click", () => {
    if (editingTestimonialIndex === null) return;
    confirmAction("Delete this testimonial?", state.testimonials[editingTestimonialIndex].name).then(ok => {
        if (!ok) return;
        state.testimonials.splice(editingTestimonialIndex, 1);
        saveDraft();
        renderTestimonialsAdmin();
        closeTestimonialModal();
        toastQuick("success", "Testimonial deleted");
    });
});

/* ==========================
   TABS
========================== */
document.querySelectorAll(".admin-tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("is-active"));
        document.querySelectorAll(".admin-panel").forEach(p => p.classList.remove("is-active"));
        tab.classList.add("is-active");
        document.getElementById("panel-" + tab.dataset.tab).classList.add("is-active");
    });
});

/* ==========================
   PUBLISH: GITHUB
========================== */
const ghOwner = document.getElementById("ghOwner");
const ghRepo = document.getElementById("ghRepo");
const ghBranch = document.getElementById("ghBranch");
const ghPath = document.getElementById("ghPath");
const ghToken = document.getElementById("ghToken");
const ghStatus = document.getElementById("ghStatus");

function loadGhSettings(){
    try {
        const saved = JSON.parse(localStorage.getItem(LS_GH_SETTINGS) || "{}");
        ghOwner.value = saved.owner || "";
        ghRepo.value = saved.repo || "";
        ghBranch.value = saved.branch || "main";
        ghPath.value = saved.path || "assets/data/content.json";
        ghToken.value = saved.token || "";
        if (saved.owner && saved.repo && saved.token){
            setGhStatus("ok", `Connected to ${saved.owner}/${saved.repo}`);
        }
    } catch(e){}
}

function setGhStatus(kind, text){
    ghStatus.className = "status-line" + (kind ? " " + kind : "");
    ghStatus.querySelector("span:last-child").textContent = text;
}

document.getElementById("saveGhSettings").addEventListener("click", () => {
    const settings = {
        owner: ghOwner.value.trim(),
        repo: ghRepo.value.trim(),
        branch: ghBranch.value.trim() || "main",
        path: ghPath.value.trim() || "assets/data/content.json",
        token: ghToken.value.trim()
    };
    if (!settings.owner || !settings.repo || !settings.token){
        toast("warning", "Missing details", "Owner, repository, and access token are required to connect.");
        return;
    }
    localStorage.setItem(LS_GH_SETTINGS, JSON.stringify(settings));
    setGhStatus("ok", `Connected to ${settings.owner}/${settings.repo}`);
    toastQuick("success", "Connection saved");
});

function b64EncodeUnicode(str){
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (m, p1) => String.fromCharCode("0x" + p1)));
}

document.getElementById("publishBtn").addEventListener("click", async () => {
    const settings = JSON.parse(localStorage.getItem(LS_GH_SETTINGS) || "{}");
    if (!settings.owner || !settings.repo || !settings.token){
        toast("warning", "Not connected", "Save your GitHub connection details first.");
        return;
    }

    const btn = document.getElementById("publishBtn");
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = "Publishing…";
    setGhStatus("", "Publishing…");

    const apiUrl = `https://api.github.com/repos/${settings.owner}/${settings.repo}/contents/${settings.path}`;
    const headers = {
        Authorization: `Bearer ${settings.token}`,
        Accept: "application/vnd.github+json"
    };

    try {
        let sha;
        const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(settings.branch)}`, { headers });
        if (getRes.ok){
            const fileData = await getRes.json();
            sha = fileData.sha;
        } else if (getRes.status !== 404){
            const errData = await getRes.json().catch(() => ({}));
            throw new Error(errData.message || `GitHub returned ${getRes.status}`);
        }

        const putRes = await fetch(apiUrl, {
            method: "PUT",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "Update site content via dashboard",
                content: b64EncodeUnicode(JSON.stringify(state, null, 2)),
                sha,
                branch: settings.branch
            })
        });

        if (!putRes.ok){
            const errData = await putRes.json().catch(() => ({}));
            throw new Error(errData.message || `GitHub returned ${putRes.status}`);
        }

        setGhStatus("ok", "Published — live in about a minute");
        toastQuick("success", "Published to GitHub");
    } catch(err){
        setGhStatus("err", "Publish failed — see message");
        toast("error", "Publish failed", err.message || "Something went wrong talking to GitHub.");
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
});

/* ==========================
   MANUAL EXPORT
========================== */
document.getElementById("downloadJsonBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "content.json";
    a.click();
    URL.revokeObjectURL(url);
    toastQuick("success", "Downloaded content.json");
});

/* ==========================
   CHANGE PASSWORD
========================== */
document.getElementById("changePwBtn").addEventListener("click", async () => {
    const oldPw = document.getElementById("oldPwInput").value;
    const newPw = document.getElementById("newPwInput").value;

    if (!oldPw || !newPw){
        toast("warning", "Missing details", "Enter your current and new password.");
        return;
    }
    if (newPw.length < 4){
        toast("warning", "Too short", "New password should be at least 4 characters.");
        return;
    }
    const oldHash = await sha256(oldPw);
    if (oldHash !== localStorage.getItem(LS_PW_HASH)){
        toast("error", "Incorrect password", "Your current password doesn't match.");
        return;
    }
    localStorage.setItem(LS_PW_HASH, await sha256(newPw));
    document.getElementById("oldPwInput").value = "";
    document.getElementById("newPwInput").value = "";
    toastQuick("success", "Password updated");
});

/* ==========================
   BOOTSTRAP
========================== */
async function enterDashboard(){
    loginScreen.style.display = "none";
    dashboardEl.style.display = "block";
    await loadState();
    renderProjectsAdmin();
    renderTestimonialsAdmin();
    loadGhSettings();
}

renderLoginMode();
if (sessionStorage.getItem(SS_AUTH) === "1" && !isFirstRun()){
    enterDashboard();
}
