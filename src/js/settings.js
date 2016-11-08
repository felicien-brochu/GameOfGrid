function Settings(gameOfGrid) {
	this.gameOfGrid = gameOfGrid;
	this.panel = document.getElementById("gog-settings-panel");
	this.autoHider = new AutoHider(
		document.getElementById("gog-game-of-grid-canvas"),
		[this.panel, document.getElementById("gog-action-buttons"), document.getElementById("gog-bottom-action-buttons")],
		2200, 150);
	this.panelDisplayed = true;

	gameOfGrid.canvas.addEventListener("click", this.onGlobalClick.bind(this));
	window.addEventListener("keydown", this.onKeyDown.bind(this));

	this.hidePanelForSmallDevice();

	this.initActionButtons();
	this.initSliders();
	this.initSymmetryRadio();
	this.initPatternButtons();

	this.panel.addEventListener("selectstart", function(e) { e.preventDefault(); });
};

Settings.prototype.hidePanelForSmallDevice = function() {
	if (window.innerWidth < 600 && this.panelDisplayed) {
		this.togglePanel();
	}
}

Settings.prototype.initActionButtons = function() {
	this.tutorialButton = document.getElementById("gog-tutorial-button");
	this.fullscreenButton = document.getElementById("gog-fullscreen-button");
	this.settingsButton = document.getElementById("gog-settings-button");
	this.resetButton = document.getElementById("gog-reset-button");
	this.playPauseButton = document.getElementById("gog-play-pause-button");
	this.undoButton = document.getElementById("gog-undo-button");
	this.redoButton = document.getElementById("gog-redo-button");

	this.tutorialButton.addEventListener('click', startTutorial);
	this.fullscreenButton.addEventListener('click', this.onFullscreenButtonMouseDown.bind(this));
	document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
	this.settingsButton.addEventListener('click', this.onSettingsButtonMouseDown.bind(this));
	this.resetButton.addEventListener('click', this.onResetClick.bind(this));
	this.playPauseButton.addEventListener('click', this.onPlayPauseClick.bind(this));
	this.undoButton.addEventListener('click', this.onUndoClick.bind(this));
	this.redoButton.addEventListener('click', this.onRedoClick.bind(this));

	var buttons = document.getElementById('gog-action-buttons').getElementsByTagName('button');
	for (var i = 0; i < buttons.length; ++i) {
		buttons[i].addEventListener("keyup", this.preventDefaultKeyUp.bind(this));
	}
}

Settings.prototype.initSliders = function() {
	this.speedSlider = document.getElementById("gog-speed-slider");
	this.traceSlider = document.getElementById("gog-trace-slider");
	this.colorSlider = document.getElementById("gog-color-slider");

	var intervalX = 2000 / (this.gameOfGrid.interval + 16) - 3;
	this.speedSlider.slider.setValue(intervalX / 38 * 100);
	this.traceSlider.slider.setValue(this.gameOfGrid.colorAgeSize / 255 * 100);
	this.colorSlider.slider.setValue(this.gameOfGrid.hueOffset);

	this.speedSlider.addEventListener('slideend', function(event) {
		this.gameOfGrid.setInterval(2000 / (event.detail / 100 * 38 + 3) - 16);
	}.bind(this));

	this.traceSlider.addEventListener('valuechanged', function(event) {
		this.gameOfGrid.setColorAgeSize(Math.floor(event.detail / 100 * 254 + 2));
	}.bind(this));

	this.colorSlider.addEventListener('valuechanged', function(event) {
		this.gameOfGrid.setHueOffset(event.detail);
	}.bind(this));
}

Settings.prototype.initSymmetryRadio = function() {
	var symmetryList = document.getElementById("gog-symmetry-container");
	var symmetriesRadios = symmetryList.getElementsByTagName("input");

	for (var i = 0; i < symmetriesRadios.length; ++i) {
		var radio = symmetriesRadios[i];
		if (radio.value == this.gameOfGrid.drawSymmetry) {
			radio.checked = true;
		}
		radio.addEventListener('change', this.onSymmetrySelect.bind(this));
	}
}

Settings.prototype.initPatternButtons = function() {
	this.crossPatternButton = document.getElementById("gog-cross-pattern-button");
	this.gunPatternButton = document.getElementById("gog-gun-pattern-button");
	this.randomPatternButton = document.getElementById("gog-random-pattern-button");
	this.canvasPatternButton = document.getElementById("gog-canvas-pattern-button");

	this.crossPatternButton.addEventListener('click', function() {
		this.gameOfGrid.generatePattern(generateCrossPattern);
	}.bind(this));
	this.gunPatternButton.addEventListener('click', function() {
		this.gameOfGrid.generatePattern(generateGunPattern);
	}.bind(this));
	this.randomPatternButton.addEventListener('click', function() {
		this.gameOfGrid.generatePattern(generateRandomPattern);
	}.bind(this));
	this.canvasPatternButton.addEventListener('click', function() {
		this.gameOfGrid.generatePattern(generatePatternCanvas);
	}.bind(this));

	var buttons = document.getElementsByTagName('button');
	for (var i = 0; i < buttons.length; ++i) {
		buttons[i].addEventListener("keyup", this.preventDefaultKeyUp.bind(this));
	}
}

Settings.prototype.onSymmetrySelect = function(event) {
	this.gameOfGrid.drawSymmetry = event.target.value;
}

Settings.prototype.onKeyDown = function(event) {
	if (event.keyCode == 32 && this.gameOfGrid) {      //< Space bar
		this.gameOfGrid.toggleGame();
		event.preventDefault();
	} else if (event.keyCode == 90 && event.ctrlKey) { //< Ctrl+Z
		this.onUndoClick();
		event.preventDefault();
	} else if (event.keyCode == 89 && event.ctrlKey) { //< Ctrl+Y
		this.onRedoClick();
		event.preventDefault();
	}
}

Settings.prototype.preventDefaultKeyUp = function(event) {
	if (event.keyCode == 32) {                         //< Space bar
		event.preventDefault();
	} else if (event.keyCode == 90 && event.ctrlKey) { //< Ctrl+Z
		event.preventDefault();
	} else if (event.keyCode == 89 && event.ctrlKey) { //< Ctrl+Y
		event.preventDefault();
	}
}

Settings.prototype.onGlobalClick = function(event) {
	if (this.gameOfGrid.started) {
		this.gameOfGrid.toggleGame();
	}
}

Settings.prototype.onGamePause = function() {
	var playIcon = this.playPauseButton.getElementsByClassName("gog-ic-play-arrow")[0];
	var pauseIcon = this.playPauseButton.getElementsByClassName("gog-ic-pause")[0];
	playIcon.style.display = "inline-block";
	pauseIcon.style.display = "none";

	this.autoHider.setEnabled(false);
}

Settings.prototype.onGameStart = function() {
	var playIcon = this.playPauseButton.getElementsByClassName("gog-ic-play-arrow")[0];
	var pauseIcon = this.playPauseButton.getElementsByClassName("gog-ic-pause")[0];
	playIcon.style.display = "none";
	pauseIcon.style.display = "inline-block";

	this.autoHider.setEnabled(true);
}

Settings.prototype.onPlayPauseClick = function() {
	if (this.gameOfGrid) {
		this.gameOfGrid.toggleGame();
	}
}

Settings.prototype.onResetClick = function() {
	if (this.gameOfGrid && !this.gameOfGrid.isReset()) {
		this.gameOfGrid.resetGame();
	}
}

Settings.prototype.onSettingsButtonMouseDown = function() {
	this.togglePanel();
}

Settings.prototype.onFullscreenButtonMouseDown = function() {
	toggleFullscreen();
}

Settings.prototype.onFullscreenChange = function() {
	var fullscreenIcon = this.fullscreenButton.getElementsByClassName("gog-ic-fullscreen")[0];
	var fullscreenExitIcon = this.fullscreenButton.getElementsByClassName("gog-ic-fullscreen-exit")[0];

	if (getFullscreenElement()) {
		fullscreenIcon.style.display = "none";
		fullscreenExitIcon.style.display = "inline-block";
	} else {
		fullscreenIcon.style.display = "inline-block";
		fullscreenExitIcon.style.display = "none";
	}
}

Settings.prototype.onUndoClick = function() {
	if (this.gameOfGrid.hasToUndo()) {
		this.gameOfGrid.undo();
	}
}

Settings.prototype.onRedoClick = function() {
	if (this.gameOfGrid.hasToRedo()) {
		this.gameOfGrid.redo();
	}
}

Settings.prototype.onHistoryChange = function() {
	setButtonEnabled(this.undoButton, this.gameOfGrid.hasToUndo());
	setButtonEnabled(this.redoButton, this.gameOfGrid.hasToRedo());
	setButtonEnabled(this.resetButton, !this.gameOfGrid.isReset());
	setButtonEnabled(this.playPauseButton, !this.gameOfGrid.isReset());
}

function setButtonEnabled(button, enabled) {
	var disabledClass = "gog-disabled";
	if (enabled) {
		button.classList.remove(disabledClass);
	} else {
		button.classList.add(disabledClass);
	}
}

Settings.prototype.togglePanel = function() {
	if (this.panelDisplayed) {
		this.panelDisplayed = false;
		this.panel.style.visibility = "hidden";
	} else {
		this.panelDisplayed = true;
		this.panel.style.visibility = "visible";
	}
}