document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".word-reveal-js").forEach(el => {
    const words = el.textContent.trim().split(/\s+/);

    el.innerHTML = words
      .map((word, i) =>
        `<span style="animation-delay:${i * 0.15}s">${word}&nbsp;</span>`
      )
      .join("");
  });

  // Mobile Nav Toggle
  const navToggle = document.getElementById("navToggle");
  const navs = document.querySelector(".navs");

  if (navToggle && navs) {
    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      navs.classList.toggle("active");
      if (navs.classList.contains("active")) {
        navToggle.classList.replace("bi-list", "bi-x");
      } else {
        navToggle.classList.replace("bi-x", "bi-list");
      }
    });

    // Close menu when clicking a link
    navs.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navs.classList.remove("active");
        navToggle.classList.replace("bi-x", "bi-list");
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!navs.contains(e.target) && !navToggle.contains(e.target)) {
        navs.classList.remove("active");
        navToggle.classList.replace("bi-x", "bi-list");
      }
    });
  }
});

function show(){
  document.querySelector(".values-section").style.display="block";
  document.querySelector(".about-btn").style.display="none";
}