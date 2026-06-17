(function () {
  "use strict";

  function closeMobileSidebar() {
    document.body.classList.remove("vertical-sidebar-enable");
  }

  function toggleSidebar() {
    var html = document.documentElement;
    var buttonIcon = document.querySelector(".hamburger-icon");
    var width = html.clientWidth;
    var layout = html.getAttribute("data-layout");

    if (buttonIcon && width > 767) {
      buttonIcon.classList.toggle("open");
    }

    if (layout === "horizontal") {
      document.body.classList.toggle("menu");
      return;
    }

    if (layout !== "vertical" && layout !== "semibox") {
      return;
    }

    if (width <= 767) {
      document.body.classList.add("vertical-sidebar-enable");
      html.setAttribute("data-sidebar-size", "lg");
      return;
    }

    document.body.classList.remove("vertical-sidebar-enable");

    if (width <= 1025) {
      html.setAttribute(
        "data-sidebar-size",
        html.getAttribute("data-sidebar-size") === "sm" ? "" : "sm"
      );
      return;
    }

    html.setAttribute(
      "data-sidebar-size",
      html.getAttribute("data-sidebar-size") === "lg" ? "sm" : "lg"
    );
  }

  function bindAdminShell() {
    var hamburger = document.getElementById("topnav-hamburger-icon");
    var overlay = document.querySelector(".vertical-overlay");

    if (hamburger && !hamburger.dataset.friloBound) {
      hamburger.dataset.friloBound = "true";
      hamburger.addEventListener("click", toggleSidebar);
    }

    if (overlay && !overlay.dataset.friloBound) {
      overlay.dataset.friloBound = "true";
      overlay.addEventListener("click", closeMobileSidebar);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindAdminShell);
  } else {
    bindAdminShell();
  }
})();
