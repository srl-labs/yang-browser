// GLOBAL PAGE LOAD URL PARAMS
var urlPath = "";
var urlPathType = "";
var urlHidePrefix = "";
const pageUrl = window.location.href;
const fetchUrlPrefix = pageUrl.split("?")[0];

// GLOBAL NODE AND FEATURE VARS
var nodes = [];
var features = [];
var matrix = {};

// GLOBAL FETCH ADDONS
const urlAdds = {
  mode: "cors",
  method: "GET",
  header: new Headers({
    "Access-Control-Allow-Origin": "*"
  })
};

// RENDER IF-FEATURES
function renderFeatures(data) {
  if(Array.isArray(data)) {
    let tmp = data.join(", ");
    tmp.includes("not") ? tmp = tmp.replaceAll("not ", "not:"): tmp;
    tmp = tmp.replaceAll("srl_nokia-feat:", "");
    tmp = tmp.replaceAll("srl-feat:", "");
    tmp = tmp.replaceAll("srl_feat:", "");
    tmp = tmp.replaceAll(" or ", "_or_");
    tmp = tmp.replaceAll(", ", "_and_");
    return tmp;
  } else {
    return "common";
  }
}

// GLOBAL DATATABLE DECLARATION
var myTable;
const order = [[1, "asc"]];
const pagingType = "simple";
const dom = "<'pt-3'><'level is-mobile'<'level-left'><'level-right'<'level-item'i><'level-item'p>>><'table-container't>";
var columnDefs = [
  { "targets": 0, "width": "10%" },
  { 
    "targets": 1, "width": "70%", "visible": false,
    "render": function (data, type, full, meta) {
      return type === 'display'? '<div class="tooltip" title="' + full.description + '">' + data : data;
    }
  },
  { 
    "targets": 2, "width": "70%",
    "render": function (data, type, full, meta) {
      return type === 'display'? '<div class="tooltip" title="' + full.description + '">' + data : data;
    }
  },
  { "targets": 3, "width": "20%" },
  { "targets": 4, "visible": false, "searchable": false },
  { "targets": 5, "visible": false },
  { "targets": 6, "visible": false,
    "render": function (data, type, full, meta) {
      return renderFeatures(data);
    } 
  }
]
const languageDataTable = { 
  "search": "", 
  "searchPlaceholder": "",
  "info": "_START_ - _END_ of _TOTAL_",
  "thousands": "",
  "infoFiltered": "",
  "infoEmpty": "",
  "paginate": {
    "previous": "<i class='fas fa-angle-double-left'></i>",
    "next": "<i class='fas fa-angle-double-right'></i>"
  }
}

// GET-ELEMENT-BY
function getElById(arg) {
  return document.getElementById(arg);
}

function getElByQuery(arg) {
  return document.querySelectorAll(arg);
}

function getElByName(arg) {
  return document.getElementsByName(arg);
}

function getElByClass(arg) {
  return document.getElementsByClassName(arg);
}

//PROCESS URL PARAMS
function processUrlParams() {
  let urlParams = new URLSearchParams(pageUrl.split("?")[1]);
  if(urlParams.has("pathType")) {
    urlPathType = urlParams.get("pathType");
  }
  if(urlParams.has("hidePrefix")) {
    urlHidePrefix = urlParams.get("hidePrefix");
  }
  if(urlParams.has("path")) {
    urlPath = urlParams.get("path");
  }

  if(urlPathType != "") {
    if(urlPathType == "All") {
      getElByName("pathType")[0].click();
    } else if(urlPathType == "State") {
      getElByName("pathType")[1].click();
    } else if(urlPathType == "Config") {
      getElByName("pathType")[2].click();
    }
  }
  if(urlHidePrefix == "true") {
    getElById("hidePrefixCheck").click();
  }
  if(urlPath != "") {
    $("#customSearch").val(urlPath);
    $("#customSearch").keyup();
  }
}

function apiFetch(kind) {
  let url;
  if(kind == "paths") {
    url = fetchUrlPrefix + "/paths.json"
    fetch(url, urlAdds)
    .then(response => response.json())
    .then(response => loadHandler(response))
    .catch(error => loadError(error));
  } 
  else if(kind == "features") {
    url = fetchUrlPrefix + "/features.txt"
    fetch(url, urlAdds)
    .then(response => { 
      if(!response.ok) {
        throw "Added filters are skipped..."
      }
      return response.text(); 
    })
    .then(response => { 
      if(response != undefined) {
        loadPlatformFeatures(response.trim());
      }
    })
    .catch(error => console.log(error));
  }
}

// PAGE ON-LOAD
window.onload = function() {
  let urlSplit = pageUrl.split("/");
  let version = urlSplit[urlSplit.length - 2];
  let versionAddon = version;
  if(version == "openconfig") {
    version = urlSplit[urlSplit.length - 3];
    versionAddon = version + " OpenConfig";
  }

  document.title = "Nokia SR Linux " + versionAddon + " YANG Model";
  getElById("version").innerHTML = versionAddon;
  const source = getElById("source");
  source.href = source.href + version;

  apiFetch("paths");
  apiFetch("features");
  
  processUrlParams();
  getElById("message").innerHTML = "";
  getElById("yangModel").classList.remove("is-hidden");
  getElById("created").classList.add("is-light");

};

// MY-TABLE FETCH ERROR
function loadError(error) {
  console.log(error);
  getElById("message").innerHTML = "Exception: Unable to load YANG model. Try reloading the page or check with Admin.";
  getElById("message").classList.add("has-text-danger");
  getElById("yangModel").innerHTML = "";
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
      {"data": "is-state", "defaultContent": "false"},
      {"data": "path-with-prefix"}, 
      {"data": "path"}, 
      {"data": "type"}, 
      {"data": "description", "defaultContent": ""},
      {"data": "is-state", "defaultContent": "false"},
      {"data": "if-features", "defaultContent": "common"}
    ],
    "drawCallback": function() {
      tableDrawCall("myTable");
    }
  });
}

// TABLE DRAW CALL BACK HANDLER
function tableDrawCall(tableName) {
  let f = "#" + tableName + "_filter";
  let p = "#" + tableName + "_paginate";
  $(f).find("input").addClass("input");
  $(p).addClass("buttons is-grouped");
  $(p + " .paginate_button").addClass("button");
  $('.paginate_button').on('click', function(e) {
    updatePageInfo(tableName);
  });
}

// TABLE SEARCH
$("#customSearch").on("keyup", function() {
  myTable.search(this.value).draw();
  let p = $(this).parent().get(0);
  if(this.value != "") {
    if(!getElById("ss")) {
      let newChild = '<a class="icon is-small is-right" id="ss"><i class="fas fa-share-alt"></i></a>';
      $(p).addClass("has-icons-right");
      $(p).append(newChild);
      $("#ss").css("color", "#3273DC");
      $("#ss").css("pointerEvents", "initial");
      $("#ss").attr("onclick", 'copyPathToClipboard("search", "")');
    }
  } else {
    if(getElById("ss")) {
      $("#ss").html("");
      $(p).children().last().remove();
      $(p).removeClass("has-icons-right");
    }
  }
});

// TOGGLE FILTER
function toggleFilter(element) {
  let keyFilter = element.value;
  if(keyFilter != "na") {
    myTable.column(5).search(keyFilter).draw();
  }
  else {
    myTable.column(5).search('').draw();
  }
}

// SHOW PREFIX
function showPrefix() {
  let col1 = myTable.column(1);
  let col2 = myTable.column(2);
  col1.visible(!col1.visible());
  col2.visible(!col2.visible());
}

// UPDATE PAGE INFO
function updatePageInfo(tableName) {
  let n = "#" + tableName + "_next";
  let p = "#" + tableName + "_previous";
  let f = "#" + tableName + "_filter";
  let info = myTable.page.info();
  if(info.page == 0) {
    $(p).addClass("disabled");
  } else {
    $(p).removeClass("disabled");
  }
  if(info.pages == 0 || info.pages == 1 || info.page == (info.pages - 1)) {
    $(n).addClass("disabled");
  } else {
    $(n).removeClass("disabled");
  }
}

// COPY PATH TO CLIPBOARD
function copyPathToClipboard(from, data) {
  let hp = getElById("hidePrefixCheck").checked;
  let pt = getElByQuery('input[name="pathType"]:checked').value;
  let params = {};
  if(pt == "na") {
    params["pathType"] = "All"
  } else if(pt == "true") {
    params["pathType"] = "State"
  } else if(pt == "false") {
    params["pathType"] = "Config"
  }
  params["hidePrefix"] = hp;
  if(from == "row") {
    if(hp) {
      params["path"] = data["path"];
    } else {
      params["path"] = data["path-with-prefix"];
    }
  } else {
    params["path"] = getElById("customSearch").value;
  }
  if(params["path"] != "") {
    let searchParams = new URLSearchParams(params);
    let tmpPageUrl = pageUrl.substring(0, pageUrl.length - 1) + "?";
    let encoded = tmpPageUrl + searchParams;
    navigator.clipboard.writeText(encoded);
    getElById("c2c").classList.remove("is-hidden");
    setTimeout(() => {
      getElById("c2c").classList.add("is-hidden");
    }, 1100);
  }
}

// DOUBLE CLICK EVENT ON TABLE ROW
$("#myTable tbody").on("dblclick", "tr", function () {
  let data = myTable.row(this).data();
  if(data !== undefined) {
    copyPathToClipboard("row", data);
  }
});

// TOGGLE MORE FILTERS
function toggleNodeFeature() {
  const nf = getElById("nodeAndFeature");
  const nfClasses = nf.className;
  const btnIcon = getElById("moreFilters").childNodes[1];
  if(nfClasses.includes("is-hidden")) {
    nf.classList.remove("is-hidden");
    btnIcon.innerHTML = '<i class="fas fa-minus"></i>';
  } else {
    nf.classList.add("is-hidden");
    btnIcon.innerHTML = '<i class="fas fa-plus"></i>';
  }
}

// DYNAMIC LOAD NODES AND FEATURES
function loadPlatformFeatures(response) {
  const map = response.split(/\n/);
  map.forEach(e => {
    s = e.split(": ");
    n = s[0];
    f = s[1].split(/\s+/);
    nodes.push(n);
    matrix[n] = f;
    f.forEach(k => {
      if(!features.includes(k)) {
        features.push(k);
      }
    });
  });
  features.sort();

  let nodeList = getElById("nodeList");
  let featureList = getElById("featureList");
  nodes.forEach(entry => {
    inputElement = chtmle("input", {
      type: "radio", class: "node-feature", name: "node", 
      id: entry, value: entry, onclick: "getFeaturesByNode()"
    }, []);
    labelElement  = chtmle("label", {class: "panel-block"}, [inputElement, ctn(entry)]);
    nodeList.appendChild(labelElement);
  });
  features.forEach(entry => {
    inputElement = chtmle("input", {
      type: "checkbox", class: "node-feature", name: "feature", 
      id: entry, value: entry, onclick: "getNodesByFeature()"
    }, []);
    labelElement = chtmle("label", {class: "panel-block"}, [inputElement, ctn(entry)]);
    featureList.appendChild(labelElement);
  });

  getElById("moreFilters").classList.remove("is-hidden");
}

// RESET PANEL SEARCH
function resetPanelSearch() {
  getElById("nodeSearch").value = "";
  searchPanel("node");
  getElById("featureSearch").value = "";
  searchPanel("feature");
}

// RESET ALL NODE AND FEATURE CHECKS
function resetChecks() {
  resetPanelSearch();
  let nodeAndFeature = getElByClass("node-feature");
  for(let entry of nodeAndFeature) {
    entry.checked = false;
  }
  myTable.column(6).search('').draw();
  getElById("moreFilters").classList.remove("is-info", "is-light");
}

// GET ALL NODES BASED ON FEATURE
function getNodesByFeature() {
  let selectedFeatures = [...getElByQuery("input[name=feature]:checked")].map(e => e.value);
  if(selectedFeatures.length == 0) {
    resetChecks();
  }
  searchFeatureColumn();
}

// GET ALL FEATURES BASED ON NODE
function getFeaturesByNode() {
  let selectedNode = getElByQuery("input[name=node]:checked")[0].value;
  let allFeatures = getElByQuery("input[name=feature]");
  if(selectedNode == "") {
    resetChecks();
  } else {
    let commonFeatures = matrix[selectedNode];
    allFeatures.forEach(entry => {
      if(commonFeatures.includes(entry.value)) {
        entry.checked = true;
      } else {
        entry.checked = false;
      }
    })
  }
  searchFeatureColumn();
}

// FILTER FEATURE COLUMN CONDITIONS TRANSFORMED
function searchFeatureColumn() {
  let selectedFeatures = [...getElByQuery("input[name=feature]:checked")].map(e => e.value);
  if(selectedFeatures.length > 0) {
    getElById("moreFilters").classList.add("is-info", "is-light");
    let filter = [];
    const featureFilter = function(data) {
      if(Array.isArray(data)) {
        let tmp = data.join(", ");
        tmp.includes("not") ? tmp = tmp.replaceAll("not ", "!"): tmp;
        tmp = tmp.replaceAll("srl_nokia-feat:", "");
        tmp = tmp.replaceAll("srl-feat:", "");
        tmp = tmp.replaceAll("srl_feat:", "");
        tmp = tmp.replaceAll(" or ", " | ");
        tmp = tmp.replaceAll(", ", " & ");
        return tmp;
      } else {
        return "common";
      }
    }
    const isOperator = function(arg) {
      if(arg == "|" || arg == "&") return true;
      else return false;
    }
    let filteredData = myTable.column(6).data().filter(function (value, index) {
      if(value != "common") return true;
      else false;
    });
    filteredData.toArray().forEach(f => {
      let exp = featureFilter(f);
      selectedFeatures.forEach(i => {
        if(exp.includes(i)) {
          exp = exp.replaceAll(i, "+");
        }
      });
      exp = exp.replaceAll("!+", "-");
      let expSplit = exp.split(" ");
      let expResult = [];
      for(i = 0; i < expSplit.length; i++) {
        if(expSplit[i] == "+" || expSplit[i] == "-") {
          expResult.push(expSplit[i])
          if(isOperator(expSplit[i + 1])) {
            expResult.push(expSplit[i + 1]);
          }
        }
      }
      if(expResult.length > 0) {
        if(isOperator(expResult[expResult.length - 1])) {
          expResult.pop();
        }
        result = expResult.join(" ");
        result = result.replaceAll("+", "1");
        result = result.replaceAll("-", "0");
        if(Function("return Boolean(" + result + ")")()) {
          let filterAdds = renderFeatures(f);
          if(!filter.includes(filterAdds)) {
            filter.push(filterAdds);
          }
        }
      }
    })
    if(filter.length > 0) {
      const filterJoined = filter.join("|") + "|common";
      myTable.column(6).search(filterJoined, true, false, false).draw();
    }
  } else {
    getElById("moreFilters").classList.remove("is-info", "is-light");
    myTable.column(6).search('').draw();
  }
}

// JQUERY CASE INSENSITIVE CONTAINS
jQuery.expr[':'].contains = function(a, i, m) {
  return jQuery(a).text().toUpperCase()
    .indexOf(m[3].toUpperCase()) >= 0;
};

// SEARCH PANEL
function searchPanel(kind) {
  const panelContainerId = "#" + kind + "List";
  const searchKey = getElById(kind + "Search").value;
  var matches = $(panelContainerId).find("label:contains(" + searchKey + ")");
  $("label", panelContainerId).not(matches).slideUp();
  matches.slideDown();
}

// CREATE HTML ELEMENT
function chtmle(tag, attrs, children) {
  let el = document.createElement(tag);
  Object.keys(attrs).forEach(function(key){
    let val = attrs[key];
    el.setAttribute(key, val);
  });
  children.forEach(function(child){
    el.appendChild(child);
  });
  return el;
}

// CREATE TEXT NODE
function ctn(text) {
  return document.createTextNode(text);
}