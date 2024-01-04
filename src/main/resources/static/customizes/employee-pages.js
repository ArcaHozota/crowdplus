let pageNum, totalRecords, totalPages, keyword;
$(document).ready(function() {
	$("#adminKanri").removeClass('collapsed');
	$("ul", $("#adminKanri")).show('fast');
	$("#toAdmin").css('color', 'darkred');
	toSelectedPg(1, keyword);
});
$("#searchBtn2").on('click', function() {
	keyword = $("#keywordInput").val();
	toSelectedPg(1, keyword);
});
function toSelectedPg(pageNum, keyword) {
	$.ajax({
		url: '/pgcrowd/employee/pagination',
		data: {
			'pageNum': pageNum,
			'keyword': keyword
		},
		type: 'GET',
		dataType: 'json',
		success: function(result) {
			buildTableBody(result);
			buildPageInfos(result);
			buildPageNavi(result);
		},
		error: function(result) {
			layer.msg(result.responseJSON.message);
		}
	});
}
function buildTableBody(result) {
	$("#tableBody").empty();
	let index = result.data.records;
	$.each(index, (index, item) => {
		let idTd = $("<th scope='row' class='text-center' style='width:150px;vertical-align:bottom;'></th>").append(item.id);
		let usernameTd = $("<td scope='row' class='text-center' style='width:70px;vertical-align:bottom;'></td>").append(item.username);
		let emailTd = $("<td scope='row' class='text-center' style='width:100px;vertical-align:bottom;'></td>").append(item.email);
		let editBtn = $("<button></button>").addClass("btn btn-primary btn-sm edit-btn")
			.append($("<i class='bi bi-pencil-fill'></i>")).append("編集");
		editBtn.attr("editId", item.id);
		let deleteBtn = $("<button></button>").addClass("btn btn-danger btn-sm delete-btn")
			.append($("<i class='bi bi-trash-fill'></i>")).append("削除");
		deleteBtn.attr("deleteId", item.id);
		let btnTd = $("<td class='text-center' style='width:100px;vertical-align:bottom;'></td>").append(editBtn).append(" ").append(deleteBtn);
		$("<tr></tr>").append(idTd).append(usernameTd).append(emailTd).append(btnTd).appendTo("#tableBody");
	});
}
$("#loginAccountInput").change(function() {
	$.ajax({
		url: '/pgcrowd/employee/check',
		data: 'loginAcct=' + this.value,
		type: 'GET',
		dataType: 'json',
		success: function(result) {
			if (result.status === 'SUCCESS') {
				showValidationMsg(this, "success", "√");
			} else {
				showValidationMsg(this, "error", result.message);
			}
		}
	});
});
$("#passwordInput").change(function() {
	let inputPassword = this.value;
	let regularPassword = /^[a-zA-Z\d]{8,23}$/;
	if (!regularPassword.test(inputPassword)) {
		showValidationMsg(this, "error", "入力したパスワードが8桁から23桁までの英数字にしなければなりません。");
	} else {
		showValidationMsg(this, "success", "√");
	}
});
$("#emailInput").change(function() {
	let inputEmail = this.value;
	let regularEmail = /^^[a-zA-Z\d._%+-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
	if (!regularEmail.test(inputEmail)) {
		showValidationMsg(this, "error", "入力したメールアドレスが正しくありません。");
	} else {
		showValidationMsg(this, "success", "√");
	}
});
$("#roleInput").change(function() {
	let ajaxResult = $.ajax({
		url: '/pgcrowd/role/delete/0L',
		type: 'DELETE',
		async: false
	});
	if (ajaxResult.status !== 200) {
		showValidationMsg(this, "error", ajaxResult.responseJSON.message);
	} else {
		showValidationMsg(this, "success", "√");
	}
});
$("#saveInfoBtn").on('click', function() {
	let inputLoginAccount = $("#loginAccountInput").val().trim();
	let inputUsername = $("#usernameInput").val().trim();
	let inputPassword = $("#passwordInput").val().trim();
	let inputEmail = $("#emailInput").val().trim();
	let inputRole = $("#roleInput").val();
	if ($("#inputForm").children().hasClass('is-invalid')) {
		return false;
	} else if (inputLoginAccount === "" || inputUsername === "" || inputPassword === "" || inputEmail === "") {
		let listArray = ["#loginAccountInput", "#usernameInput", "#passwordInput", "#emailInput"];
		pgcrowdNullInputboxDiscern(listArray);
	} else {
		let postData = JSON.stringify({
			'loginAccount': inputLoginAccount,
			'username': inputUsername,
			'password': inputPassword,
			'email': inputEmail,
			'roleId': inputRole
		});
		pgcrowdAjaxModify('/pgcrowd/employee/infosave', 'POST', postData, postSuccessFunction);
	}
});
$("#addInfoBtn").on('click', function(e) {
	e.preventDefault();
	let url = '/pgcrowd/employee/to/addition';
	checkPermissionAndTransfer(url);
});
$("#tableBody").on('click', '.delete-btn', function() {
	let userName = $(this).parents("tr").find("td:eq(0)").text().trim();
	let userId = $(this).attr("deleteId");
	if (confirm("この" + userName + "という社員の情報を削除するとよろしいでしょうか。")) {
		pgcrowdAjaxModify('/pgcrowd/employee/delete/' + userId, 'DELETE', null, deleteSuccessFunction);
	}
});
$("#tableBody").on('click', '.edit-btn', function() {
	let editId = $(this).attr("editId");
	let url = '/pgcrowd/employee/to/edition?editId=' + editId;
	checkPermissionAndTransfer(url);
});
$("#passwordEdit").change(function() {
	let editPassword = this.value;
	let regularPassword = /^[a-zA-Z\d]{8,23}$/;
	if (!regularPassword.test(editPassword)) {
		showValidationMsg(this, "error", "入力したパスワードが8桁から23桁までの英数字にしなければなりません。");
	} else {
		showValidationMsg(this, "success", "√");
	}
});
$("#emailEdit").change(function() {
	let editEmail = this.value;
	let regularEmail = /^^[a-zA-Z\d._%+-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
	if (!regularEmail.test(editEmail)) {
		showValidationMsg(this, "error", "入力したメールアドレスが正しくありません。");
	} else {
		showValidationMsg(this, "success", "√");
	}
});
$("#roleEdit").change(function() {
	let ajaxResult = $.ajax({
		url: '/pgcrowd/role/delete/0L',
		type: 'DELETE',
		async: false
	});
	if (ajaxResult.status !== 200) {
		showValidationMsg(this, "error", ajaxResult.responseJSON.message);
	} else {
		showValidationMsg(this, "success", "√");
	}
});
$("#editInfoBtn").on('click', function() {
	let editId = $("#editId").text();
	let editLoginAccount = $("#loginAccountEdit").text();
	let editUsername = $("#usernameEdit").val().trim();
	let editPassword = $("#passwordEdit").val().trim();
	let editEmail = $("#emailEdit").val().trim();
	let editRole = $("#roleEdit option:selected").val();
	if ($("#editForm").children().hasClass('is-invalid')) {
		return false;
	} else if (editUsername === "" || editPassword === "" || editEmail === "") {
		let listArray = ["#usernameEdit", "#passwordEdit", "#emailEdit"];
		pgcrowdNullInputboxDiscern(listArray);
	} else {
		if (editPassword === "**************************************") {
			editPassword = null;
		}
		let putData = JSON.stringify({
			'id': editId,
			'loginAccount': editLoginAccount,
			'username': editUsername,
			'password': editPassword,
			'email': editEmail,
			'roleId': editRole
		});
		pgcrowdAjaxModify('/pgcrowd/employee/infoupd', 'PUT', putData, putSuccessFunction);
	}
});
function postSuccessFunction() {
	window.location.replace('/pgcrowd/employee/to/pages?pageNum=' + totalRecords);
}
function putSuccessFunction() {
	window.location.replace('/pgcrowd/employee/to/pages?pageNum=' + pageNum);
}
function deleteSuccessFunction() {
	layer.msg('削除済み');
	toSelectedPg(pageNum, keyword);
}
$("#resetBtn").on('click', function() {
	formReset($("#inputForm"));
});
$("#restoreBtn").on('click', function() {
	let userId = $("#editId").text();
	formReset($("#editForm"));
	$.ajax({
		url: '/pgcrowd/employee/inforestore',
		data: 'userId=' + userId,
		type: 'GET',
		dataType: 'json',
		success: function(result) {
			let restoredInfo = result.data;
			$("#usernameEdit").val(restoredInfo.username);
			$("#passwordEdit").val('**************************************');
			$("#emailEdit").val(restoredInfo.email);
		}
	});
});