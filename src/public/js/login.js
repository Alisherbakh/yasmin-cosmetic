console.log("Login frontend javascript file");

$(function () {
  const $nickInput = $(".member-nick");
  const $rememberCheckbox = $(".remember-checkbox");
  const $form = $(".login-frame");

  const savedNick = localStorage.getItem("rememberedMemberNick");
  if (savedNick) {
    $nickInput.val(savedNick);
    $rememberCheckbox.prop("checked", true);
  }

  $form.on("submit", function () {
    if ($rememberCheckbox.is(":checked")) {
      localStorage.setItem("rememberedMemberNick", $nickInput.val());
    } else {
      localStorage.removeItem("rememberedMemberNick");
    }
  });
});
