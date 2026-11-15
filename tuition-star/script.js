
/* ==========================================================================
   TUITION STAR — script.js
   Vanilla JavaScript interactions
   --------------------------------------------------------------------------
   1.  Helpers & preferences
   2.  Preloader
   3.  Header, scroll progress, active navigation, back-to-top
   4.  Mobile navigation
   5.  Smooth scrolling
   6.  Scroll reveal animations
   7.  Animated counters
   8.  Testimonial carousel
   9.  FAQ accordion
   10. Gallery lightbox
   11. Course details modal
   12. Enrollment form validation
   13. Misc (footer year, focus trap)
   ========================================================================== */

(function () {
  "use strict";

  /* 1. HELPERS & PREFERENCES
     ====================================================================== */
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scrollBehavior = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

  /** Keep keyboard focus inside an open dialog. */
  function trapFocus(event, container) {
    if (event.key !== "Tab") return;
    const focusable = $$(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      container
    ).filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* 2. PRELOADER
     ====================================================================== */
  const preloader = $("#preloader");
  let preloaderHidden = false;

  function hidePreloader() {
    if (!preloader || preloaderHidden) return;
    preloaderHidden = true;
    preloader.classList.add("is-hidden");
    window.setTimeout(() => preloader.remove(), 650);
  }

  window.addEventListener("load", () => window.setTimeout(hidePreloader, 450));
  window.setTimeout(hidePreloader, 2800); // failsafe if load never fires

  /* 3. HEADER, SCROLL PROGRESS, ACTIVE NAV, BACK-TO-TOP
     ====================================================================== */
  const header = $("#siteHeader");
  const scrollProgress = $("#scrollProgress");
  const backToTop = $("#backToTop");
  const navLinks = $$(".nav-link");
  const navSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function setActiveNav(id) {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function updateActiveNav() {
    if (!navSections.length) return;
    const line = window.scrollY + (header ? header.offsetHeight : 84) + 90;
    let current = navSections[0].id;
    navSections.forEach((section) => {
      if (section.offsetTop <= line) current = section.id;
    });
    setActiveNav(current);
  }

  let scrollTicking = false;

  function handleScroll() {
    const y = window.scrollY;

    if (header) header.classList.toggle("scrolled", y > 20);

    if (scrollProgress) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? Math.min(y / scrollable, 1) : 0;
      scrollProgress.style.transform = "scaleX(" + ratio + ")";
    }

    if (backToTop) backToTop.classList.toggle("is-visible", y > 520);

    updateActiveNav();
    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(handleScroll);
        scrollTicking = true;
      }
    },
    { passive: true }
  );

  handleScroll();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
  }

  if (backToTop) backToTop.addEventListener("click", scrollToTop);
  const footerTop = $("#footerTop");
  if (footerTop) footerTop.addEventListener("click", scrollToTop);

  /* 4. MOBILE NAVIGATION
     ====================================================================== */
  const navToggle = $("#navToggle");
  const primaryNav = $("#primaryNav");
  const navOverlay = $("#navOverlay");
  const mobileQuery = window.matchMedia("(max-width: 1100px)");

  function isMenuOpen() {
    return primaryNav && primaryNav.classList.contains("is-open");
  }

  function openMenu() {
    if (!primaryNav) return;
    primaryNav.classList.add("is-open");
    if (navToggle) {
      navToggle.classList.add("is-active");
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Close navigation menu");
    }
    if (header) header.classList.add("menu-open");
    if (navOverlay) {
      navOverlay.classList.add("is-visible");
      navOverlay.setAttribute("aria-hidden", "false");
    }
    document.body.classList.add("is-locked");
  }

  function closeMenu() {
    if (!primaryNav) return;
    primaryNav.classList.remove("is-open");
    if (navToggle) {
      navToggle.classList.remove("is-active");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation menu");
    }
    if (header) header.classList.remove("menu-open");
    if (navOverlay) {
      navOverlay.classList.remove("is-visible");
      navOverlay.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("is-locked");
  }

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      if (isMenuOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (navOverlay) navOverlay.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isMenuOpen()) {
      closeMenu();
      if (navToggle) navToggle.focus();
    }
  });

  function handleViewportChange() {
    if (!mobileQuery.matches) closeMenu();
  }

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", handleViewportChange);
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(handleViewportChange);
  }

  /* 5. SMOOTH SCROLLING
     ====================================================================== */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      closeMenu();

      const offset = (header ? header.offsetHeight : 84) + 14;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top: Math.max(top, 0), behavior: scrollBehavior() });

      if (link.classList.contains("nav-link")) {
        setActiveNav(hash.slice(1));
      }
    });
  });

  /* 6. SCROLL REVEAL ANIMATIONS
     ====================================================================== */
  const revealElements = $$(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add("is-visible"));
  }

  /* 7. ANIMATED COUNTERS
     ====================================================================== */
  const counters = $$(".counter");

  function runCounter(counter) {
    const target = Number(counter.getAttribute("data-counter")) || 0;
    const suffix = counter.getAttribute("data-suffix") || "";
    const duration = 1700;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.round(target * eased).toLocaleString("en-IN") + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(tick);
      }
    }

    window.requestAnimationFrame(tick);
  }

  function showFinalCounts() {
    counters.forEach((counter) => {
      counter.textContent =
        (Number(counter.getAttribute("data-counter")) || 0).toLocaleString("en-IN") +
        (counter.getAttribute("data-suffix") || "");
    });
  }

  if (reduceMotion.matches) {
    showFinalCounts();
  } else if ("IntersectionObserver" in window) {
    const resultsGrid = $(".results-grid");
    if (resultsGrid) {
      const counterObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              counters.forEach(runCounter);
              observer.disconnect();
            }
          });
        },
        { threshold: 0.35 }
      );
      counterObserver.observe(resultsGrid);
    }
  } else {
    showFinalCounts();
  }

  /* 8. TESTIMONIAL CAROUSEL
     ====================================================================== */
  const track = $("#testimonialTrack");
  const viewport = $("#testimonialViewport");
  const dotsWrap = $("#testimonialDots");
  const prevBtn = $("#prevTestimonial");
  const nextBtn = $("#nextTestimonial");
  let currentSlide = 0;
  let autoplayTimer = null;
  let slides = [];
  let pauseCarousel = null;

  if (track && dotsWrap) {
    slides = $$(".testimonial-slide", track);

    const dots = slides.map((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slider-dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Go to testimonial " + (index + 1));
      dot.addEventListener("click", () => {
        goToSlide(index);
        restartAutoplay();
      });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function updateCarousel() {
      track.style.transform = "translateX(-" + currentSlide * 100 + "%)";

      dots.forEach((dot, index) => {
        const active = index === currentSlide;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", String(active));
        dot.tabIndex = active ? 0 : -1;
      });

      slides.forEach((slide, index) => {
        slide.setAttribute("aria-hidden", String(index !== currentSlide));
      });
    }

    function goToSlide(index) {
      if (!slides.length) return;
      currentSlide = (index + slides.length) % slides.length;
      updateCarousel();
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function startAutoplay() {
      if (reduceMotion.matches || slides.length < 2) return;
      stopAutoplay();
      autoplayTimer = window.setInterval(() => goToSlide(currentSlide + 1), 6500);
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    pauseCarousel = stopAutoplay;

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        goToSlide(currentSlide - 1);
        restartAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        goToSlide(currentSlide + 1);
        restartAutoplay();
      });
    }

    if (viewport) {
      viewport.addEventListener("mouseenter", stopAutoplay);
      viewport.addEventListener("mouseleave", startAutoplay);
      viewport.addEventListener("focusin", stopAutoplay);
      viewport.addEventListener("focusout", startAutoplay);

      // Swipe support
      let pointerStartX = null;
      viewport.addEventListener("pointerdown", (event) => {
        pointerStartX = event.clientX;
      });
      viewport.addEventListener("pointerup", (event) => {
        if (pointerStartX === null) return;
        const delta = event.clientX - pointerStartX;
        pointerStartX = null;
        if (Math.abs(delta) < 45) return;
        goToSlide(currentSlide + (delta < 0 ? 1 : -1));
        restartAutoplay();
      });
      viewport.addEventListener("pointercancel", () => {
        pointerStartX = null;
      });

      viewport.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          goToSlide(currentSlide - 1);
          restartAutoplay();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          goToSlide(currentSlide + 1);
          restartAutoplay();
        }
      });
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    updateCarousel();
    startAutoplay();
  }

  /* 9. FAQ ACCORDION
     ====================================================================== */
  const faqItems = $$(".faq-item");

  // Remove the hidden attribute so the height transition can run.
  $$(".faq-answer").forEach((answer) => {
    answer.hidden = false;
  });

  function closeFaq(item) {
    item.classList.remove("is-open");
    const button = $(".faq-question", item);
    if (button) button.setAttribute("aria-expanded", "false");
  }

  function openFaq(item) {
    item.classList.add("is-open");
    const button = $(".faq-question", item);
    if (button) button.setAttribute("aria-expanded", "true");
  }

  faqItems.forEach((item) => {
    const button = $(".faq-question", item);
    if (!button) return;

    button.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      faqItems.forEach((other) => {
        if (other !== item) closeFaq(other);
      });
      if (isOpen) {
        closeFaq(item);
      } else {
        openFaq(item);
      }
    });
  });

  /* 10. GALLERY LIGHTBOX
     ====================================================================== */
  const galleryItems = $$(".gallery-item");
  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightboxImage");
  const lightboxCaption = $("#lightboxCaption");
  const lightboxCounter = $("#lightboxCounter");
  const lightboxClose = $("#lightboxClose");
  const lightboxPrev = $("#lightboxPrev");
  const lightboxNext = $("#lightboxNext");
  let lightboxIndex = 0;
  let lightboxTrigger = null;

  const galleryData = galleryItems.map((item) => {
    const img = $("img", item);
    return {
      src: img ? img.getAttribute("src") : "",
      alt: img ? img.getAttribute("alt") : "",
      caption: item.getAttribute("data-caption") || "",
    };
  });

  function renderLightbox() {
    const item = galleryData[lightboxIndex];
    if (!item) return;
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
    lightboxCaption.textContent = item.caption;
    lightboxCounter.textContent = lightboxIndex + 1 + " / " + galleryData.length;
  }

  function openLightbox(index) {
    if (!lightbox) return;
    lightboxIndex = index;
    lightboxTrigger = document.activeElement;
    renderLightbox();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    if (lightboxTrigger) lightboxTrigger.focus();
    lightboxTrigger = null;
  }

  function showLightboxImage(step) {
    if (!galleryData.length) return;
    lightboxIndex = (lightboxIndex + step + galleryData.length) % galleryData.length;
    renderLightbox();
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => openLightbox(index));
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener("click", () => showLightboxImage(-1));
  if (lightboxNext) lightboxNext.addEventListener("click", () => showLightboxImage(1));

  $$("[data-close-lightbox]").forEach((el) => {
    el.addEventListener("click", closeLightbox);
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox || !lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      closeLightbox();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      showLightboxImage(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showLightboxImage(1);
    } else if (event.key === "Tab") {
      trapFocus(event, lightbox);
    }
  });

  /* 11. COURSE DETAILS MODAL
     ====================================================================== */
  const courseModal = $("#courseModal");
  const modalClose = $("#modalClose");
  const modalIcon = $("#modalIcon");
  const modalTag = $("#modalTag");
  const modalTitle = $("#modalTitle");
  const modalDesc = $("#modalDesc");
  const modalPoints = $("#modalPoints");
  const modalMeta = $("#modalMeta");
  const modalEnroll = $("#modalEnroll");
  let modalTrigger = null;
  let activeCourse = null;

  const courses = {
    primary: {
      icon: "fa-solid fa-shapes",
      tag: "Classes 1–5",
      title: "Primary Education",
      desc: "A warm, activity-led foundation program that makes school subjects feel simple, playful and genuinely interesting.",
      points: [
        "Reading, writing and numeracy foundations",
        "Activity-based lessons with visual aids",
        "Weekly worksheets and reading practice",
        "Personal attention in batches of 8",
        "Parent updates every month",
      ],
      meta: [
        ["Subjects", "English, Maths, EVS"],
        ["Sessions", "3 per week"],
        ["Batch size", "8 students"],
      ],
      form: { grade: "1-5", subject: "all" },
    },
    middle: {
      icon: "fa-solid fa-book-open",
      tag: "Classes 6–8",
      title: "Middle School",
      desc: "Concept-based learning that connects classroom topics to the real world and builds strong study habits.",
      points: [
        "Concept clarity across core subjects",
        "Weekly practice and revision worksheets",
        "Chapter-wise quizzes to catch gaps early",
        "Doubt-solving after every class",
        "Monthly progress reports for parents",
      ],
      meta: [
        ["Subjects", "Maths, Science, English, SST"],
        ["Sessions", "3 per week"],
        ["Batch size", "10 students"],
      ],
      form: { grade: "6-8", subject: "all" },
    },
    secondary: {
      icon: "fa-solid fa-graduation-cap",
      tag: "Classes 9–10",
      title: "Secondary Education",
      desc: "Focused board examination preparation with structured revision cycles, mock exams and personalised feedback.",
      points: [
        "CBSE and ICSE aligned syllabus coverage",
        "Chapter tests plus full-length mock exams",
        "Numericals, diagrams and answer-writing practice",
        "Special doubt-clearing and revision weeks",
        "Detailed performance analysis after every test",
      ],
      meta: [
        ["Subjects", "Maths, Science, English, SST"],
        ["Sessions", "4 per week"],
        ["Batch size", "10 students"],
      ],
      form: { grade: "9-10", subject: "all" },
    },
    higher: {
      icon: "fa-solid fa-user-graduate",
      tag: "Classes 11–12",
      title: "Higher Secondary",
      desc: "Stream-specific coaching for Science and Commerce students, taught by subject specialists with exam-first clarity.",
      points: [
        "Physics, Chemistry, Maths and Biology",
        "Accountancy, Business Studies and Economics",
        "Board pattern question practice",
        "Numericals and case-study workshops",
        "One-on-one strategy sessions before exams",
      ],
      meta: [
        ["Streams", "Science & Commerce"],
        ["Sessions", "4 per week"],
        ["Batch size", "10 students"],
      ],
      form: { grade: "11-12", subject: "science" },
    },
    maths: {
      icon: "fa-solid fa-square-root-variable",
      tag: "Special Program",
      title: "Mathematics Special",
      desc: "A dedicated mathematics program for students who want conceptual depth, confidence and faster problem-solving.",
      points: [
        "Doubt-first, step-by-step problem solving",
        "Speed and accuracy drills every week",
        "Concept maps for formulas and theorems",
        "Board and competitive-style questions",
        "Personalised practice sets",
      ],
      meta: [
        ["Focus", "Classes 8–12"],
        ["Sessions", "3 per week"],
        ["Batch size", "10 students"],
      ],
      form: { grade: "maths", subject: "mathematics" },
    },
    science: {
      icon: "fa-solid fa-flask",
      tag: "Special Program",
      title: "Science Special",
      desc: "Physics, Chemistry and Biology brought to life through demonstrations, diagrams and practical concept building.",
      points: [
        "Lab-style demonstrations and visual models",
        "Numericals and diagram mastery",
        "NCERT plus reference-book practice",
        "Practical viva and exam preparation",
        "Weekly concept tests with feedback",
      ],
      meta: [
        ["Focus", "Classes 8–12"],
        ["Sessions", "3 per week"],
        ["Batch size", "10 students"],
      ],
      form: { grade: "science", subject: "science" },
    },
  };

  function openCourseModal(key, trigger) {
    const course = courses[key];
    if (!course || !courseModal) return;

    activeCourse = course;
    modalTrigger = trigger || document.activeElement;

    modalIcon.innerHTML = '<i class="' + course.icon + '" aria-hidden="true"></i>';
    modalTag.textContent = course.tag;
    modalTitle.textContent = course.title;
    modalDesc.textContent = course.desc;
    modalPoints.innerHTML = course.points
      .map(
        (point) =>
          '<li><i class="fa-solid fa-check" aria-hidden="true"></i><span>' + point + "</span></li>"
      )
      .join("");
    modalMeta.innerHTML = course.meta
      .map(
        (item) =>
          "<span>" + item[0] + ": <strong>" + item[1] + "</strong></span>"
      )
      .join("");

    courseModal.classList.add("is-open");
    courseModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    if (modalClose) modalClose.focus();
  }

  function closeCourseModal() {
    if (!courseModal) return;
    courseModal.classList.remove("is-open");
    courseModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    if (modalTrigger) modalTrigger.focus();
    modalTrigger = null;
  }

  $$("[data-course]").forEach((button) => {
    button.addEventListener("click", () => {
      openCourseModal(button.getAttribute("data-course"), button);
    });
  });

  if (modalClose) modalClose.addEventListener("click", closeCourseModal);

  $$("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeCourseModal);
  });

  document.addEventListener("keydown", (event) => {
    if (!courseModal || !courseModal.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      closeCourseModal();
    } else if (event.key === "Tab") {
      trapFocus(event, courseModal);
    }
  });

  // "Enrol for this program" — close modal, prefill the form and guide the user there.
  if (modalEnroll) {
    modalEnroll.addEventListener("click", () => {
      if (!activeCourse) return;
      const gradeSelect = $("#classSelect");
      const subjectSelect = $("#subjectSelect");

      if (gradeSelect) gradeSelect.value = activeCourse.form.grade;
      if (subjectSelect) subjectSelect.value = activeCourse.form.subject;

      const courseName = activeCourse.title;
      closeCourseModal();

      const contactSection = $("#contact");
      if (contactSection) {
        const offset = (header ? header.offsetHeight : 84) + 14;
        const top = contactSection.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: Math.max(top, 0), behavior: scrollBehavior() });
      }

      window.setTimeout(() => {
        const studentInput = $("#studentName");
        if (studentInput) studentInput.focus({ preventScroll: true });
      }, 550);

      // Let the user know why they landed here.
      const formHead = $(".form-head p");
      if (formHead) {
        formHead.textContent =
          "Applying for " + courseName + " — complete the details below. Fields marked * are required.";
      }
    });
  }

  /* 12. ENROLLMENT FORM VALIDATION
     ====================================================================== */
  const form = $("#enrollmentForm");
  const successBox = $("#formSuccess");
  const successText = $("#formSuccessText");
  const errorBox = $("#formError");
  const successClose = $("#formSuccessClose");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  const namePattern = /^[\p{L}\p{M}\s.'-]{2,60}$/u;

  const fieldRules = {
    studentName: (value) =>
      namePattern.test(value.trim()) ? "" : "Please enter a valid student name (2–60 characters).",
    parentName: (value) =>
      namePattern.test(value.trim()) ? "" : "Please enter a valid parent or guardian name.",
    email: (value) =>
      emailPattern.test(value.trim()) ? "" : "Please enter a valid email address (e.g. name@example.com).",
    phone: (value) => {
      const digits = value.replace(/\D/g, "");
      if (!/^\+?[\d\s().-]{10,20}$/.test(value.trim()) || digits.length < 10 || digits.length > 15) {
        return "Please enter a valid phone number with 10–15 digits.";
      }
      return "";
    },
    classSelect: (value) => (value ? "" : "Please select a class."),
    subjectSelect: (value) => (value ? "" : "Please select a subject."),
    message: (value) =>
      value.length <= 500 ? "" : "Please keep your message under 500 characters.",
  };

  function setFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    const field = input.closest(".form-field");
    const errorEl = document.getElementById(fieldId + "Error");

    if (message) {
      if (field) field.classList.add("is-invalid");
      input.setAttribute("aria-invalid", "true");
      if (errorEl) errorEl.textContent = message;
    } else {
      if (field) field.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
      if (errorEl) errorEl.textContent = "";
    }
  }

  function validateField(fieldId) {
    const input = document.getElementById(fieldId);
    if (!input || !fieldRules[fieldId]) return true;
    const message = fieldRules[fieldId](input.value);
    setFieldError(fieldId, message);
    return !message;
  }

  if (form) {
    const fieldIds = Object.keys(fieldRules);

    fieldIds.forEach((fieldId) => {
      const input = document.getElementById(fieldId);
      if (!input) return;

      input.addEventListener("blur", () => {
        if (input.value.trim() !== "" || input.closest(".form-field").classList.contains("is-invalid")) {
          validateField(fieldId);
        }
      });

      input.addEventListener("input", () => {
        if (input.closest(".form-field").classList.contains("is-invalid")) {
          validateField(fieldId);
        }
      });

      input.addEventListener("change", () => {
        if (input.tagName === "SELECT") validateField(fieldId);
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (successBox) successBox.hidden = true;

      const invalidFields = fieldIds.filter((fieldId) => !validateField(fieldId));

      if (invalidFields.length) {
        if (errorBox) errorBox.hidden = false;

        const firstInvalid = document.getElementById(invalidFields[0]);
        if (firstInvalid) {
          const offset = (header ? header.offsetHeight : 84) + 30;
          const top = firstInvalid.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: Math.max(top, 0), behavior: scrollBehavior() });
          window.setTimeout(() => firstInvalid.focus({ preventScroll: true }), 300);
        }
        return;
      }

      if (errorBox) errorBox.hidden = true;

      const studentName = (document.getElementById("studentName") || {}).value || "";
      const selectedClass = document.getElementById("classSelect");
      const classLabel = selectedClass
        ? selectedClass.options[selectedClass.selectedIndex].textContent
        : "";

      if (successText) {
        successText.textContent =
          "Thank you, " +
          studentName.trim() +
          "! Your application for " +
          classLabel +
          " passed validation. This is a frontend-only demo — no details were sent to a server or stored anywhere.";
      }

      if (successBox) {
        successBox.hidden = false;
        successBox.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      }

      form.reset();
      fieldIds.forEach((fieldId) => setFieldError(fieldId, ""));

      // Integration point: replace this demo confirmation with a fetch() call
      // to your backend endpoint when one becomes available.
    });

    if (successClose) {
      successClose.addEventListener("click", () => {
        if (successBox) successBox.hidden = true;
      });
    }

    form.addEventListener("input", () => {
      if (successBox && !successBox.hidden) successBox.hidden = true;
    });
  }

  /* 13. MISC
     ====================================================================== */
  const year = $("#currentYear");
  if (year) year.textContent = String(new Date().getFullYear());

  // Close overlays if the window is resized to a very small height
  window.addEventListener("resize", () => {
    if (!mobileQuery.matches && isMenuOpen()) closeMenu();
  });

  // Respect changes to the reduced-motion preference at runtime
  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", (event) => {
      if (event.matches) {
        if (typeof pauseCarousel === "function") pauseCarousel();
        revealElements.forEach((el) => el.classList.add("is-visible"));
        showFinalCounts();
      }
    });
  }
})();
