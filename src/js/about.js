function showAboutPopup() {
	var popup = document.getElementById("gog-about-popup");
	popup.style.display = "block";
}

function hideAboutPopup() {
	var popup = document.getElementById("gog-about-popup");
	popup.style.display = "none";
}

(function() {
	var showButton = document.getElementById("gog-about-button");
	var popup = document.getElementById("gog-about-popup");
	var closeButton = popup.getElementsByTagName("button")[0];

	showButton.addEventListener("click", showAboutPopup);
	closeButton.addEventListener("click", hideAboutPopup);
})();