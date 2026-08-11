console.log("Basic frontend javascript file");

$(document).on("click", ".admin-sidebar-toggle", function () {
  $(".admin-shell").toggleClass("sidebar-collapsed");
});

$(document).on("click", ".toggle-password", function () {
  const $button = $(this);
  const $input = $button.siblings("input");
  const isPassword = $input.attr("type") === "password";

  $input.attr("type", isPassword ? "text" : "password");
  $button.toggleClass("is-visible", isPassword);
  $button.attr("aria-label", isPassword ? "Hide password" : "Show password");
});
