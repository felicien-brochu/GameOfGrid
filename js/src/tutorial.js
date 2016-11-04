function Tutorial() {
	this.popupIds = [
		"gog-welcome-popup",
		"gog-play-popup",
		"gog-history-popup",
		"gog-clear-popup",
		"gog-menu-popup",
		"gog-sliders-popup",
		"gog-symmetry-popup",
		"gog-patterns-popup",
		"gog-fullscreen-popup",
		"gog-tutorial-popup"
	];
	
	this.currentPopup = -1;
	
	for (var i = 0; i < this.popupIds.length; i++) {
		var popup = document.getElementById(this.popupIds[i]);

		var skipButtons = popup.getElementsByClassName("gog-skip-button");
		if (skipButtons && skipButtons.length == 1) {
			skipButtons[0].addEventListener("click", this.skip.bind(this));
		}

		var nextButtons = popup.getElementsByClassName("gog-next-button");
		if (nextButtons && nextButtons.length == 1) {
			nextButtons[0].addEventListener("click", this.nextStep.bind(this));
		}
	}
}

Tutorial.prototype.start = function() {
	if (this.currentPopup > -1 && this.currentPopup < this.popupIds.length) {
		this.skip();
	}
	this.currentPopup = -1;
	this.nextStep();
}

Tutorial.prototype.nextStep = function() {
	if (this.currentPopup >= 0) {
		this.hideCurrentPopup();
	}

	this.currentPopup++;

	if (this.currentPopup < this.popupIds.length) {
		var popup = document.getElementById(this.popupIds[this.currentPopup]);
		popup.style.display = 'block';
	} else {
		this.end();
	}
}

Tutorial.prototype.hideCurrentPopup = function() {
	var popup = document.getElementById(this.popupIds[this.currentPopup]);
	popup.style.display = 'none';
}

Tutorial.prototype.skip = function() {
	this.hideCurrentPopup();
	this.end();
}

Tutorial.prototype.end = function() {
	localStorage.setItem('tutorialSeen', true);
}

function startTutorial() {
	if (!settings.panelDisplayed) {
		settings.togglePanel();
	}
	tutorial.start();
}

var tutorial = new Tutorial();