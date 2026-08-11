console.log("Users frontend javascript file");

$(function () {
    $(".user-search").on("input", function () {
        const query = $(this).val().trim().toLowerCase();

        $(".admin-table tbody tr").each(function () {
            const $row = $(this);
            const name = $row.find(".user-name-cell").text().toLowerCase();
            const phone = $row.find(".user-phone-cell").text().toLowerCase();
            const matches = !query || name.includes(query) || phone.includes(query);

            $row.toggle(matches);
        });
    });

    $(".member-status").on("change", function (e) {
        const id = e.target.id;
        console.log("id:", id);

        const $select = $(`#${id}.member-status`);
        const memberStatus = $select.val();
        console.log("memberStatus:", memberStatus);

        $select
            .removeClass("status-ACTIVE status-BLOCK status-DELETE")
            .addClass(`status-${memberStatus}`);

        //TODO Axios updateChosenUser
        axios
        .post("/admin/user/edit", {
            _id: id,
            memberStatus: memberStatus,
        }).then((response) => {
            console.log("response:", response);
            const result = response.data;
            console.log("result:", result);

            if(result.data) {
                console.log("User update!");
                $(".member-status").blur();
            } else alert("User update failed!");
        }).catch((err) => {
            console.log(err);
            alert("User update failed!");
        });
    });
});