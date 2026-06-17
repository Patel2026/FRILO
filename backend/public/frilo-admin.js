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
    var dropdownTriggers = document.querySelectorAll("[data-bs-toggle='dropdown']");

    if (hamburger && !hamburger.dataset.friloBound) {
      hamburger.dataset.friloBound = "true";
      hamburger.addEventListener("click", toggleSidebar);
    }

    if (overlay && !overlay.dataset.friloBound) {
      overlay.dataset.friloBound = "true";
      overlay.addEventListener("click", closeMobileSidebar);
    }

    dropdownTriggers.forEach(function (trigger) {
      var parent = trigger.closest(".dropdown");
      var menu = parent ? parent.querySelector(".dropdown-menu") : null;

      if (!parent || !menu || trigger.dataset.friloDropdownBound) {
        return;
      }

      trigger.dataset.friloDropdownBound = "true";
      trigger.addEventListener("click", function (event) {
        if (window.bootstrap && window.bootstrap.Dropdown) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        var willOpen = !menu.classList.contains("show");
        closeDropdowns();

        if (willOpen) {
          parent.classList.add("show");
          menu.classList.add("show");
          trigger.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  function toggleFallbackDropdown(trigger) {
    var parent = trigger.closest(".dropdown");
    var menu = parent ? parent.querySelector(".dropdown-menu") : null;

    if (!parent || !menu) {
      return;
    }

    var willOpen = !menu.classList.contains("show");
    closeDropdowns();

    if (willOpen) {
      parent.classList.add("show");
      menu.classList.add("show");
      trigger.setAttribute("aria-expanded", "true");
    }
  }

  function closeDropdowns() {
    document.querySelectorAll(".dropdown-menu.show").forEach(function (menu) {
      var parent = menu.closest(".dropdown");
      var trigger = parent ? parent.querySelector("[data-bs-toggle='dropdown']") : null;

      menu.classList.remove("show");
      if (parent) {
        parent.classList.remove("show");
      }
      if (trigger) {
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindAdminShell);
  } else {
    bindAdminShell();
  }

  window.friloAdmin = window.friloAdmin || {};
  window.friloAdmin.closeDropdowns = closeDropdowns;
  window.friloAdmin.toggleDropdown = toggleFallbackDropdown;

  document.addEventListener(
    "click",
    function (event) {
      var trigger = event.target.closest(".frilo-notification-trigger");

      if (!trigger || (window.bootstrap && window.bootstrap.Dropdown)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      toggleFallbackDropdown(trigger);
    },
    true
  );

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".dropdown")) {
      closeDropdowns();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeDropdowns();
    }
  });
})();
