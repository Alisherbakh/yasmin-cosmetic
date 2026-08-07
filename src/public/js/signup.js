console.log("Signup frontend javascript file");
  $(function (){
    const fileTarget = $(".file-box .upload-hidden");
    let filename;

    fileTarget.on("change", function() {
        if (window.FileReader) {
            const uploadFIle = $(this)[0].files[0];
            const fileType = uploadFIle["type"];
            const validImageType = ["image/jpg", "image/jpeg", "image/png"];
            if (!validImageType.includes(fileType)){
                alert("Please insert only jpeg, jpg and png!");
            }else {
                if(uploadFIle){
                    console.log(URL.createObjectURL(uploadFIle));
                    $(".upload-img-frame")
                    .attr("src", URL.createObjectURL(uploadFIle))
                    .addClass("success");
                }
                filename = $(this)[0].files[0].name;
            }
            $(this).siblings(".upload-name").val(filename);
        }
    });
  });

  function validateSignupForm() {
    const memberNick = $(".member-nick").val(),
      memberPhone = $(".member-phone").val(),
      memberPassword = $(".member-password").val(),
      confirmPassword = $(".confirm-password").val();

    if (
        memberNick === "" || 
        memberPhone === "" || 
        memberPassword === "" || 
        confirmPassword === "" 
    ) {
        alert("Please insert all required inputs");
        return false;
    }
    
    if (memberPassword !== confirmPassword){
        alert("Password differs, please check!");
        return false;
    }

    const memberImage = $(".member-image").get(0).files[0].name 
    ? $(".member-image").get(0).files[0].name 
    : null;
    if (!memberImage) {
        alert("Please upload a store logo or image!");
        return false;
    }
  }
