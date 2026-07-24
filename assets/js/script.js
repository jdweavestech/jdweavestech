/* ---------------- THEME ---------------- */
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
function setTheme(dark){
root.classList.toggle('dark', dark);
}
setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
themeToggle.addEventListener('click', () => setTheme(!root.classList.contains('dark')));

/* ---------------- SMOOTH SCROLL (Lenis) ---------------- */
const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time)=>{ lenis.raf(time*1000); });
gsap.ticker.lagSmoothing(0);

document.querySelectorAll('a[href^="#"]').forEach(a=>{
a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    if(id.length>1){
    e.preventDefault();
    const target = document.querySelector(id);
    if(target) lenis.scrollTo(target, { offset: -60 });
    }
});
});

/* ---------------- HEADER STATE ---------------- */
ScrollTrigger.create({
start: 20, end: 99999,
onUpdate: self => document.getElementById('siteHeader').classList.toggle('scrolled', self.scroll() > 20)
});

/* ---------------- CUSTOM CURSOR ---------------- */
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
const label = document.getElementById('cursorLabel');
const isFinePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

if(isFinePointer){
const dotX = gsap.quickTo(dot, "x", { duration:0.15, ease:"power3" });
const dotY = gsap.quickTo(dot, "y", { duration:0.15, ease:"power3" });
const ringX = gsap.quickTo(ring, "x", { duration:0.45, ease:"power3" });
const ringY = gsap.quickTo(ring, "y", { duration:0.45, ease:"power3" });

window.addEventListener('mousemove', e=>{
    dotX(e.clientX); dotY(e.clientY);
    ringX(e.clientX); ringY(e.clientY);
});

const labels = {
    view: "View",
    click: "Click",
    hire: "Hire",
    send: "Send",
    more: "More",
    visit: "Visit"
};

document.addEventListener("mouseover", (e) => {

    const el = e.target.closest("[data-cursor]");
    if (!el) return;

    ring.classList.add("grow");
    label.textContent = labels[el.dataset.cursor] || "";

});

document.addEventListener("mouseout", (e) => {

    const el = e.target.closest("[data-cursor]");
    if (!el) return;

    ring.classList.remove("grow");
    label.textContent = "";

});

/* magnetic buttons */
document.querySelectorAll('.btn, .theme-toggle').forEach(btn=>{
    btn.addEventListener('mousemove', e=>{
    const r = btn.getBoundingClientRect();
    const relX = e.clientX - r.left - r.width/2;
    const relY = e.clientY - r.top - r.height/2;
    gsap.to(btn, { x: relX*0.25, y: relY*0.4, duration:0.4, ease:'power3' });
    });
    btn.addEventListener('mouseleave', ()=>{
    gsap.to(btn, { x:0, y:0, duration:0.5, ease:'elastic.out(1,0.4)' });
    });
});
}

/* ---------------- HERO TEXT REVEAL ---------------- */
gsap.set('.hero h1 .line span', { yPercent: 110 });
gsap.timeline({ delay: 0.2 })
.to('.hero h1 .line span', { yPercent:0, duration:1, stagger:0.12, ease:'power4.out' })
.from('.hero p.lead, .hero-cta, .stats-row', { opacity:0, y:24, duration:0.9, stagger:0.12, ease:'power3.out' }, "-=0.5")
.to('#codeWindow', { opacity:1, y:0, duration:1, ease:'power3.out' }, "-=0.9");

/* ---------------- PRELOADER ---------------- */
const preloader = document.getElementById('preloader');
const preloaderFill = document.getElementById('preloaderFill');
const preloaderCount = document.getElementById('preloaderCount');
const preloaderLine = document.getElementById('preloaderLine');

const bootLines = [
    '$ npm run dev',
    '$ compiling modules...',
    '$ ready in 412ms ✓'
];

const preloadProgress = { val: 0 };
let currentLine = -1;

gsap.to(preloadProgress, {
    val: 100,
    duration: 1.8,
    ease: 'power1.inOut',

    onStart: () => {
        preloaderLine.textContent = bootLines[0];
    },

    onUpdate: () => {
        const v = Math.floor(preloadProgress.val);

        preloaderFill.style.width = `${v}%`;
        preloaderCount.textContent = `${String(v).padStart(2, '0')}%`;

        let index = 0;

        if (v >= 85) {
            index = 2;
        } else if (v >= 40) {
            index = 1;
        }

        if (index !== currentLine) {
            currentLine = index;
            preloaderLine.textContent = bootLines[index];
        }
    },

    onComplete: () => {
        preloaderFill.style.width = '100%';
        preloaderCount.textContent = '100%';
        preloaderLine.textContent = bootLines[2];

        gsap.to(preloader, {
            yPercent: -100,
            duration: 0.9,
            ease: 'power4.inOut',
            delay: 0.25,
            onComplete: () => {
                preloader.style.display = 'none';
                document.body.classList.remove('is-loading');

                if (typeof lenis !== 'undefined') {
                    lenis.start();
                }

                if (typeof heroTl !== 'undefined') {
                    heroTl.play();
                }

                if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.refresh();
                }
            }
        });
    }
});

/* ---------------- TYPEWRITER CODE ---------------- */
const codeLines = [
{
    text: '<span class="kw">const</span> developer = {',
    pause: 300
},
{
    text: '&nbsp;&nbsp;name: <span class="str">"Jommel Dalisaymo"</span>,',
    pause: 200
},
{
    text: '&nbsp;&nbsp;role: <span class="str">"Web Developer"</span>,',
    pause: 200
},
{
    text: '&nbsp;&nbsp;platforms: [<span class="str">"WordPress"</span>, <span class="str">"Shopify"</span>, <span class="str">"Webflow"</span>],',
    pause: 200
},
{
    text: '&nbsp;&nbsp;specialty: <span class="str">"Custom Web Development"</span>,',
    pause: 200
},
{
    text: '&nbsp;&nbsp;<span class="fn">availableForHire</span>: <span class="kw">true</span>',
    pause: 200
},
{
    text: '};',
    pause: 900
},
];
const typedEl = document.getElementById('typedCode');
async function typeLoop(){
while(true){
    typedEl.innerHTML = '';
    for(const line of codeLines){
    const div = document.createElement('div');
    typedEl.appendChild(div);
    let built = '';
    const chars = line.text.split(/(<[^>]+>)/g).filter(Boolean);
    for(const chunk of chars){
        if(chunk.startsWith('<')){ built += chunk; div.innerHTML = built; }
        else{
        for(const ch of chunk){
            built += ch;
            div.innerHTML = built;
            await new Promise(r=>setTimeout(r, 14));
        }
        }
    }
    await new Promise(r=>setTimeout(r, line.pause));
    }
    const caret = document.createElement('span');
    caret.className = 'cursor-caret';
    typedEl.appendChild(caret);
    await new Promise(r=>setTimeout(r, 1400));
}
}
typeLoop();

/* ---------------- CONTACT FORM ---------------- */
const form = document.querySelector(".contact-form");
const btn = form.querySelector(".btn");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    btn.disabled = true;
    btn.textContent = "Sending...";

    try {
        const formData = new FormData(form);

        const response = await fetch(form.action, {
            method: "POST",
            body: formData,
            headers: {
                Accept: "application/json"
            }
        });

        const data = await response.json();

        if (response.ok) {
            form.reset();

            Swal.fire({
                icon: "success",
                title: "Message Sent!",
                text: "Thanks for reaching out. I'll get back to you as soon as possible.",
                confirmButtonText: "Awesome"
            });

        } else {

            Swal.fire({
                icon: "error",
                title: "Oops!",
                text: data.errors?.[0]?.message || data.error || "Something went wrong.",
                confirmButtonText: "Try Again"
            });

        }

    } catch (err) {

        console.error(err);

        Swal.fire({
            icon: "error",
            title: "Connection Error",
            text: "Unable to send your message.",
            confirmButtonText: "Close"
        });

    }

    btn.disabled = false;
    btn.textContent = "Run send-message →";
});

/* ---------------- MARQUEE ---------------- */
const track = document.getElementById('marqueeTrack');
gsap.to(track, { xPercent:-50, duration:18, ease:'none', repeat:-1 });

/* ---------------- SCROLL REVEALS ---------------- */
gsap.utils.toArray('.reveal').forEach(el=>{
gsap.to(el, {
    opacity:1, y:0, duration:1, ease:'power3.out',
    scrollTrigger: { trigger: el, start:'top 88%' }
});
});

gsap.utils.toArray('.project-card').forEach((card,i)=>{
gsap.from(card, {
    opacity:0, y:60, duration:1, ease:'power3.out', delay: (i%2)*0.1,
    scrollTrigger:{ trigger: card, start:'top 90%' }
});
});

// gsap.utils.toArray('.tag').forEach((tag,i)=>{
//     gsap.from(tag, {
//         opacity:0, y:16, duration:0.6, ease:'power2.out', delay: i*0.03,
//         scrollTrigger:{ trigger:'.tag-cloud', start:'top 85%' }
//     });
// });

gsap.utils.toArray(".tag-cloud").forEach((cloud) => {
    gsap.fromTo(
        cloud.querySelectorAll(".tag"),
        {
            opacity: 0,
            y: 40
        },
        {
            opacity: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
                trigger: cloud,
                start: "top 85%",
                once: true
            }
        }
    );
});

/* stat counters */
gsap.utils.toArray('.stat b').forEach(el=>{
const raw = el.textContent.trim();
const num = parseInt(raw.replace(/\D/g,''));
const suffix = raw.replace(/[0-9]/g,'');
if(!isNaN(num)){
    const obj = { val:0 };
    ScrollTrigger.create({
    trigger: el, start:'top 90%', once:true,
    onEnter: ()=> gsap.to(obj, {
        val:num, duration:1.6, ease:'power2.out',
        onUpdate: ()=> el.textContent = Math.floor(obj.val) + suffix
    })
    });
}
});

ScrollTrigger.refresh();


// NAV LINKS ACTIVE
// Hero - remove all active nav links
ScrollTrigger.create({
    trigger: "#hero",
    start: "top center",
    end: "bottom center",

    onEnter: clearActiveNav,
    onEnterBack: clearActiveNav
});

// Other sections - activate matching nav link
gsap.utils.toArray("section[id]:not(#hero)").forEach((section) => {
    ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",

        onEnter: () => setActiveNav(section.id),
        onEnterBack: () => setActiveNav(section.id)
    });
});

function clearActiveNav() {
    document
        .querySelectorAll(".nav-links a")
        .forEach(link => link.classList.remove("active"));
}

function setActiveNav(id) {
    document
        .querySelectorAll(".nav-links a")
        .forEach(link => {
            link.classList.toggle(
                "active",
                link.getAttribute("href") === `#${id}`
            );
        });
}


const scrollTopBtn = document.querySelector(".scroll-top");

scrollTopBtn.addEventListener("click", () => {
    lenis.scrollTo(0, {
        duration: 1.2,
        easing: t => 1 - Math.pow(1 - t, 3)
    });
});

ScrollTrigger.create({
    start: 300,
    onUpdate: (self) => {
        scrollTopBtn.classList.toggle("show", self.scroll() > 300);
    }
});



const aboutPhoto = document.querySelector(".about-photo");

const MAX_ROTATION = 10;

aboutPhoto.addEventListener("mousemove", (e) => {
    const rect = aboutPhoto.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const rotateY = (x - 0.5) * MAX_ROTATION * 2;
    const rotateX = (0.5 - y) * MAX_ROTATION * 2;

    gsap.to(aboutPhoto, {
        rotateX,
        rotateY,
        scale: 1.03,
        transformPerspective: 1200,
        transformOrigin: "center center",
        duration: 0.25,
        ease: "power2.out"
    });
});

aboutPhoto.addEventListener("mouseleave", () => {
    gsap.to(aboutPhoto, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.6,
        ease: "power3.out"
    });
});



/* ---------------- PROJECT MODAL ---------------- */
const projectData = {
    projectOne: {
        kicker: "01 · Project",
        file: "project-one.md",
        title: "Lorem Ipsum",
        image: "https://api.dicebear.com/9.x/shapes/svg?seed=project-one",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        tags: ["WordPress", "PHP", "JavaScript"],
        link: "https://example.com",
        nda: false
    },

    projectTwo: {
        kicker: "02 · Project",
        file: "project-two.md",
        title: "Dolor Sit",
        image: "https://api.dicebear.com/9.x/shapes/svg?seed=project-two",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam quis nostrud exercitation ullamco.",
        tags: ["Shopify", "Liquid", "CSS", "HubSpot"],
        link: "https://example.com",
        nda: false
    },

    projectThree: {
        kicker: "03 · Project",
        file: "project-three.md",
        title: "Consectetur",
        image: "https://api.dicebear.com/9.x/shapes/svg?seed=project-three",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        tags: ["WordPress", "WooCommerce", "REST API"],
        nda: false
    },

    projectFour: {
        kicker: "04 · Project",
        file: "project-four.md",
        title: "Adipiscing Elit",
        image: "https://api.dicebear.com/9.x/shapes/svg?seed=project-four",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse.",
        tags: ["Webflow", "GSAP", "Performance"],
        nda: false
    },

    projectFive: {
        kicker: "05 · Project",
        file: "project-five.md",
        title: "Project Five",
        image: "https://api.dicebear.com/9.x/shapes/svg?seed=project-five",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.",
        tags: ["PHP", "MySQL", "API"],
        link: "https://example.com",
        nda: false
    },

    projectSix: {
        kicker: "06 · Project",
        file: "project-six.md",
        title: "Project Six",
        image: "https://api.dicebear.com/9.x/shapes/svg?seed=project-six",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur.",
        tags: ["WordPress", "WooCommerce"],
        nda: false
    },

    projectSeven: {
        kicker: "07 · Project",
        file: "project-seven.md",
        title: "Project Seven",
        image: "https://api.dicebear.com/9.x/shapes/svg?seed=project-seven",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mattis consectetur purus sit amet fermentum.",
        tags: ["Shopify", "Liquid"],
        nda: false
    },

    projectEight: {
        kicker: "08 · Project",
        file: "project-eight.md",
        title: "Project Eight",
        image: "https://api.dicebear.com/9.x/shapes/svg?seed=project-eight",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum id ligula porta felis euismod semper.",
        tags: ["Webflow", "GSAP"],
        nda: false
    }
};

const modalOverlay = document.getElementById('projectModalOverlay');
const modalEl = document.getElementById('projectModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalKicker = document.getElementById('modalKicker');
const modalFile = document.getElementById('modalFile');
const modalProjectLink = document.getElementById("modalProjectLink");
const modalDescription = document.getElementById('modalDescription');
const modalTags = document.getElementById('modalTags');
// const modalNda = document.getElementById('modalNda');
// const modalNdaNote = document.getElementById('modalNdaNote');
let lastFocusedEl = null;

// Initial page load
attachProjectHover();

modalEl.addEventListener(
    "wheel",
    (e)=>{

        e.stopPropagation();

    },
    { passive:false }
);

function openProjectModal(key){

    const data = projectData[key];

    if(!data) return;

    modalImage.src = data.image;
    modalImage.alt = data.title + " project preview";

    modalTitle.textContent = data.title;
    modalKicker.textContent = data.kicker;
    modalFile.textContent = data.file;
    modalDescription.textContent = data.description;
    if (data.link) {
        modalProjectLink.href = data.link;
        modalProjectLink.style.display = "inline-flex";
    } else {
        modalProjectLink.href = "#";
        modalProjectLink.style.display = "none";
    }

    modalTags.innerHTML =
        data.tags.map(tag => `<span>${tag}</span>`).join("");

    lastFocusedEl = document.activeElement;

    document.body.classList.add("is-loading");

    lenis.stop();

    modalOverlay.classList.add("is-open");

    gsap.to(modalEl,{
        y:0,
        scale:1,
        opacity:1,
        duration:.55,
        ease:"power3.out",

        onComplete(){

            modalEl.focus();

        }

    });

}

function closeProjectModal(){

    gsap.to(modalEl,{

        y:24,
        scale:.98,
        opacity:0,

        duration:.35,

        ease:"power2.in",

        onComplete(){

            modalOverlay.classList.remove("is-open");

            document.body.classList.remove("is-loading");

            lenis.start();

            if(lastFocusedEl){

                lastFocusedEl.focus({
                    preventScroll:true
                });

            }

        }

    });

}

// document.querySelectorAll('.project-card[data-project]').forEach(card=>{
//     card.addEventListener('click', ()=> openProjectModal(card.dataset.project));
//     card.addEventListener('keydown', e=>{
//         if(e.key === 'Enter' || e.key === ' '){
//             e.preventDefault();
//             openProjectModal(card.dataset.project);
//         }
//     });
// });

document.getElementById('modalCta').addEventListener('click', (e)=>{
    e.preventDefault();
    closeProjectModal();
    setTimeout(()=>{
        const target = document.querySelector('#contact');
        if(target) lenis.scrollTo(target, { offset:-60 });
    }, 380);
});

document.getElementById('modalClose').addEventListener('click', closeProjectModal);
modalOverlay.addEventListener('click', e=>{
    if(e.target === modalOverlay) closeProjectModal();
});
document.addEventListener('keydown', e=>{
    if(e.key === 'Escape' && modalOverlay.classList.contains('is-open')) closeProjectModal();
});

gsap.utils.toArray('.tag').forEach((tag,i)=>{
    gsap.from(tag, {
        opacity:0, y:16, duration:0.6, ease:'power2.out', delay: i*0.03,
        scrollTrigger:{ trigger:'.tag-cloud', start:'top 85%' }
    });
});



const projectGrid = document.getElementById("projectGrid");
const loadMoreBtn = document.getElementById("loadMoreBtn");

const PROJECTS_PER_LOAD = 4;
let visibleProjects = 0;

const projects = [
    {
        key: "projectOne",
        index: "01",
        title: "Lorem Ipsum",
        image: "https://api.dicebear.com/9.x/shapes/svg?seed=project-one",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        tags: ["WordPress", "PHP", "JavaScript"]
    },
    {
        key: "projectTwo",
        index: "02",
        title: "Dolor Sit",
        image: "https://api.dicebear.com/9.x/shapes/svg?seed=project-two",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam quis nostrud exercitation ullamco.",
        tags: ["Shopify", "Liquid", "CSS", "HubSpot"]
    },
    {
        key: "projectThree",
        index: "03",
        title: "Consectetur",
        image: "https://api.dicebear.com/9.x/shapes/svg?seed=project-three",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        tags: ["WordPress", "WooCommerce", "REST API"]
    },
    {
        key: "projectFour",
        index: "04",
        title: "Adipiscing Elit",
        image: "https://api.dicebear.com/9.x/shapes/svg?seed=project-four",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse.",
        tags: ["Webflow", "GSAP", "Performance"]
    },

    // Duplicate examples
    {
        key: "projectFive",
        index: "05",
        title: "Project Five",
        image: "https://api.dicebear.com/9.x/shapes/svg?seed=project-five",
        description: "Lorem ipsum dolor sit amet.",
        tags: ["PHP","MySQL","API"]
    },
    {
        key: "projectSix",
        index: "06",
        title: "Project Six",
        image: "https://api.dicebear.com/9.x/shapes/svg?seed=project-six",
        description: "Lorem ipsum dolor sit amet.",
        tags: ["WordPress","WooCommerce"]
    },
    {
        key: "projectSeven",
        index: "07",
        title: "Project Seven",
        image: "https://api.dicebear.com/9.x/shapes/svg?seed=project-seven",
        description: "Lorem ipsum dolor sit amet.",
        tags: ["Shopify","Liquid"]
    },
    {
        key: "projectEight",
        index: "08",
        title: "Project Eight",
        image: "https://api.dicebear.com/9.x/shapes/svg?seed=project-eight",
        description: "Lorem ipsum dolor sit amet.",
        tags: ["Webflow","GSAP"]
    }
];

// function attachProjectEvents() {
//     document.querySelectorAll(".project-card[data-project]").forEach((card) => {

//         // Prevent attaching twice
//         if (card.dataset.bound) return;
//         card.dataset.bound = "true";

//         card.addEventListener("click", () => {
//             openProjectModal(card.dataset.project);
//         });

//         card.addEventListener("keydown", (e) => {
//             if (e.key === "Enter" || e.key === " ") {
//                 e.preventDefault();
//                 openProjectModal(card.dataset.project);
//             }
//         });

//     });
// }

function attachProjectHover() {
    document.querySelectorAll(".project-card").forEach((card) => {

        // prevent duplicate listeners
        if (card.dataset.hoverAttached) return;
        card.dataset.hoverAttached = "true";

        card.addEventListener("mouseenter", () => {
            gsap.to(card, {
                y: -8,
                rotateX: 4,
                rotateY: -4,
                scale: 1.02,
                duration: 0.35,
                ease: "power2.out"
            });
        });

        card.addEventListener("mouseleave", () => {
            gsap.to(card, {
                y: 0,
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                duration: 0.4,
                ease: "power2.out"
            });
        });

    });
}

projectGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".project-card");

    if (!card) return;

    openProjectModal(card.dataset.project);
});

projectGrid.addEventListener("keydown", (e) => {
    const card = e.target.closest(".project-card");

    if (!card) return;

    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openProjectModal(card.dataset.project);
    }
});

function renderProjects(){

    const nextProjects = projects.slice(
        visibleProjects,
        visibleProjects + PROJECTS_PER_LOAD
    );

    nextProjects.forEach(project=>{

        projectGrid.insertAdjacentHTML("beforeend",`

            <div class="project-card"
                    data-project="${project.key}"
                    data-cursor="view"
                    tabindex="0"
                    role="button">

                <div class="project-media">
                    <span class="project-index mono">
                        ${project.index} / Project
                    </span>

                    <img src="${project.image}" alt="${project.title}">
                </div>

                <div class="project-body">

                    <div class="project-top">

                        <h3>${project.title}</h3>

                        <span class="project-arrow">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M7 17 17 7M8 7h9v9"/>
                            </svg>
                        </span>

                    </div>

                    <p>${project.description}</p>

                    <div class="project-tags">

                        ${project.tags.map(tag=>`<span>${tag}</span>`).join("")}

                    </div>

                </div>

            </div>

        `);

    });

    visibleProjects += PROJECTS_PER_LOAD;

    if(visibleProjects >= projects.length){
        loadMoreBtn.style.display = "none";
    }

    attachProjectHover();
}

loadMoreBtn.addEventListener("click", renderProjects);

// Initial 4 projects
renderProjects();
attachProjectHover();






const testimonialsGrid = document.getElementById("testimonialsGrid");
const loadMoreTestimonialsBtn = document.getElementById("loadMoreTestimonialsBtn");

const TESTIMONIALS_PER_LOAD = 3;
let visibleTestimonials = 0;

const testimonials = [

    {
        name: "Priya Shah",
        role: "Founder, Nimbus Analytics",
        avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=priya-shah",
        quote: "Jom rebuilt our dashboard in six weeks and it's been rock solid since. Clear communication the entire way through."
    },

    {
        name: "Marcus Lee",
        role: "COO, Loom Market",
        avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=marcus-lee",
        quote: "We handed over a messy spec and got back a marketplace that actually handles payouts correctly. Rare combination of speed and care."
    },

    {
        name: "Dana Kim",
        role: "Head of Sales, PulseCRM",
        avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=dana-kim",
        quote: "Our CRM went from a spreadsheet to a proper tool our sales team actually enjoys using. Support after launch has been excellent too."
    },

    // Additional testimonials

    {
        name: "Sophia Turner",
        role: "Marketing Director",
        avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=sophia-turner",
        quote: "Excellent communication from start to finish. The final website exceeded our expectations."
    },

    {
        name: "Michael Ross",
        role: "Startup Founder",
        avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=michael-ross",
        quote: "Fast turnaround, clean code, and every feature worked exactly as discussed."
    },

    {
        name: "Emily Chen",
        role: "eCommerce Manager",
        avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=emily-chen",
        quote: "Our Shopify store is significantly faster after the optimization work. Highly recommended."
    },

    {
        name: "Ryan Cooper",
        role: "Product Manager",
        avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=ryan-cooper",
        quote: "Professional, responsive, and always willing to suggest better technical solutions."
    },

    {
        name: "Isabella Moore",
        role: "Agency Owner",
        avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=isabella-moore",
        quote: "We've worked together on multiple projects now. Every delivery has been on time and reliable."
    },

    {
        name: "David Kim",
        role: "Business Owner",
        avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=david-kim",
        quote: "One of the best developers we've hired. Great attention to detail and excellent communication."
    }

];

function renderTestimonials() {

    const nextTestimonials = testimonials.slice(
        visibleTestimonials,
        visibleTestimonials + TESTIMONIALS_PER_LOAD
    );

    nextTestimonials.forEach(testimonial => {

        testimonialsGrid.insertAdjacentHTML("beforeend", `

            <div class="testi-card">

                <div>

                    <div class="stars">
                        ${'<svg viewBox="0 0 20 20"><path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 14.9 4.4 18l1.4-6.2L1 7.5l6.4-.6z"/></svg>'.repeat(5)}
                    </div>

                    <p>"${testimonial.quote}"</p>

                </div>

                <div class="testi-who">

                    <div class="avatar">
                        <img src="${testimonial.avatar}" alt="${testimonial.name}">
                    </div>

                    <div>
                        <b>${testimonial.name}</b>
                        <span>${testimonial.role}</span>
                    </div>

                </div>

            </div>

        `);

    });

    visibleTestimonials += TESTIMONIALS_PER_LOAD;

    // Animate newly added cards
    gsap.from(
        testimonialsGrid.querySelectorAll(".testi-card:not(.animated)"),
        {
            opacity: 0,
            y: 40,
            duration: 0.6,
            stagger: 0.08,
            ease: "power2.out"
        }
    );

    testimonialsGrid
        .querySelectorAll(".testi-card:not(.animated)")
        .forEach(card => card.classList.add("animated"));

    ScrollTrigger.refresh();

    if (visibleTestimonials >= testimonials.length) {
        loadMoreTestimonialsBtn.style.display = "none";
    }

}

loadMoreTestimonialsBtn.addEventListener("click", renderTestimonials);

// Show first 3
renderTestimonials();