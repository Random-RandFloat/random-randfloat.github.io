var tabcontainers = document.querySelectorAll(".tabs");
tabcontainers.forEach(function (tabcontainer) {
    var tab_buttons = tabcontainer.querySelectorAll("button[role=tab]");
    tab_buttons.forEach(function (tab_button) {
        tab_button.addEventListener("click", function (e) {
            tab_buttons.forEach(function (other_button) {
                other_button.setAttribute("aria-selected", "false");
            });
            tab_button.setAttribute("aria-selected", "true");
            tabcontainer.querySelectorAll("article[role=tabpanel]").forEach(function (tabpanel) {
                tabpanel.setAttribute("hidden", "");
            });
            tabcontainer.querySelector("article#".concat(tab_button.getAttribute("aria-controls"), "[role=tabpanel]")).removeAttribute("hidden");
        });
    });
});
function showAboutWindow() {
    location.hash = "#about-window";
}
document.addEventListener("keydown", function (e) {
    if (e.key == "F1") {
        showAboutWindow();
    }
});
function levenshteinDistance(str1, str2) {
    var m = str1.length;
    var n = str2.length;
    var dp = [];
    for (var i = 0; i <= m; i++) {
        dp[i] = new Array(n + 1);
        dp[i][0] = i;
    }
    for (var j = 0; j <= n; j++) {
        dp[0][j] = j;
    }
    for (var i = 1; i <= m; i++) {
        for (var j = 1; j <= n; j++) {
            var cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(dp[i - 1][j] + 1, // deletion
            dp[i][j - 1] + 1, // insertion
            dp[i - 1][j - 1] + cost // substitution
            );
        }
    }
    return dp[m][n];
}
function searchProjects() {
    var query = document.querySelector("#project-search").value;
    var projects_list = document.querySelector("#projects");
    var projects = [];
    projects_list.querySelectorAll(".project").forEach(function (project) {
        var proj = {
            "title": project.querySelector(".project-title").textContent,
            "description": project.querySelector(".project-description").textContent.replaceAll("\t", ""),
            "element": project,
            "edit_distance": 0
        };
        proj.edit_distance = levenshteinDistance(proj.title, query);
        projects.push(proj);
    });
    while (projects_list.firstChild)
        projects_list.removeChild(projects_list.firstChild);
    projects = projects.sort(function (a, b) { return a.edit_distance - b.edit_distance; });
    for (var i = 0; i < projects.length; i++) {
        var project = projects[i];
        projects_list.appendChild(project.element);
        if (i < projects.length - 1)
            projects_list.appendChild(document.createElement("hr"));
    }
}
