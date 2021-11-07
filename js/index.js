// DEFAULTS
var myTable;
var order = [[0, "asc"]];
var pagingType = "simple";
var dom = "<'pt-3'><'level'<'level-left'><'level-right'<'level-item'i><'level-item'p>>><'pt-3'>t";
var columnDefs = [
  { 
    "width": "80%", "targets": 0, 
    "render": function (data, type, full, meta) {
      return type === 'display'? '<div class="tooltip" title="' + full.description + '">' + data : data;
    } 
  },
  { "width": "20%", "targets": 1 },
  { "searchable": false, "targets": 2, "visible": false }
]
var languageDataTable = { 
  "search": "", 
  "searchPlaceholder": "Search by Path or Type...",
  "info": "_START_ - _END_ of _TOTAL_",
  "infoFiltered": "",
  "infoEmpty": "",
  "paginate": {
    "previous": "<i class='fas fa-angle-double-left'></i>",
    "next": "<i class='fas fa-angle-double-right'></i>"
  }
}

// TABLE DRAW CALL BACK HANDLER
function tableDrawCall(tableName) {
  var f = "#" + tableName + "_filter";
  var p = "#" + tableName + "_paginate";
  $(f).find("input").addClass("input");
  $(p).addClass("buttons is-grouped");
  $(p + " .paginate_button").addClass("button");
  $('.paginate_button').on('click', function(e) {
    updatePageInfo(tableName);
  });
  $("#message").html("");
  $("#yangModel").css("display", "");
  $("#created").addClass("is-light");
}

// TABLE SEARCH
$(".customSearch").on("keyup", function() {
  var key = this.value;
  myTable.search(key).draw();
  updatePageInfo("myTable");
});

// UPDATE PAGE INFO
function updatePageInfo(tableName) {
  var n = "#" + tableName + "_next";
  var p = "#" + tableName + "_previous";
  var f = "#" + tableName + "_filter";
  var info = myTable.page.info();
  if(info.page == 0) {
    $(p).addClass("disabled");
  } else {
    $(p).removeClass("disabled");
  }
  if(info.page == (info.pages - 1) || info.pages == 1) {
    $(n).addClass("disabled");
  } else {
    $(n).removeClass("disabled");
  }
}

// PAGE ON-LOAD
window.onload = function() {
  var version = window.location.href.split("/");
  version = version[version.length - 2];
  document.title = "Nokia SR Linux " + version + " YANG Model";
  $("#version").html(version);
  $("#source").attr("href", "https://github.com/nokia/srlinux-yang-models/tree/" + version);
  var urlPrefix = "https://sivasusi.gitlabe2-pages.ext.net.nokia.com/srl-yang-models/";
  var url = urlPrefix + version + "/paths.json"
  let sentData = {
    mode: "cors",
    method: "GET",
    header: new Headers({
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    })
  };
  fetch(url, sentData)
  .then(response => response.json())
  .then(response => loadHandler(response))
  .catch(error => loadError(error));
};

// MY-TABLE FETCH ERROR
function loadError(error) {
  console.log(error);
  $("#message").html("Exception: Unable to load YANG model. Try reloading the page or check with Admin.");
  $("#message").addClass("has-text-danger");
  $("#yangModel").innerHTML = "";
}

// MY-TABLE LOAD HANDLER
function loadHandler(response) {
  myTable = $("#myTable").DataTable({
    "mark": true,
    "dom": dom,
    "order": order,
    "pageLength": 40,
    "autoWidth": false,
    "columnDefs": columnDefs,
    "pagingType": pagingType,
    "language": languageDataTable,
    "data": response,
    "columns": [
      {"data": "path"}, 
      {"data": "type"}, 
      {"data": "description", "defaultContent": ""}
    ],
    "drawCallback": function() {
      tableDrawCall("myTable");
    }
  });
}