function Settings(gameOfLife) {
	this.gameOfLife = gameOfLife;
	this.panel = document.getElementById("gog-settings-panel");
	this.autoHider = new AutoHider(
		document.getElementById("gog-game-of-life-canvas"),
		[this.panel, document.getElementById("gog-action-buttons")],
		2200, 150);
	this.panelDisplayed = true;
	
	this.isShadowDirty = true;
	this.rendering = false;

	window.addEventListener("keydown", this.onKeyDown.bind(this));
	
	this.initActionButtons();
	this.initSliders();
	this.initSymmetryRadio();
};

Settings.prototype.initActionButtons = function() {
	this.fullscreenButton = document.getElementById("gog-full-screen-button");
	this.settingsButton = document.getElementById("gog-settings-button");
	this.nextPatternButton = document.getElementById("gog-next-pattern-button");
	this.resetButton = document.getElementById("gog-reset-button");
	this.playPauseButton = document.getElementById("gog-play-pause-button");
	
	this.fullscreenButton.addEventListener('click', this.onFullscreenButtonMouseDown.bind(this));
	this.settingsButton.addEventListener('click', this.onSettingsButtonMouseDown.bind(this));
	this.nextPatternButton.addEventListener('click', this.onNextPatternClick.bind(this));
	this.resetButton.addEventListener('click', this.onResetClick.bind(this));
	this.playPauseButton.addEventListener('click', this.onPlayPauseClick.bind(this));
	
	var buttons = document.getElementById('gog-action-buttons').getElementsByTagName('button');
	for (var i = 0; i < buttons.length; ++i) {
		buttons[i].addEventListener("keyup", this.onKeyUp.bind(this));
	}
}

Settings.prototype.initSliders = function() {
	this.speedSlider = document.getElementById("gog-speed-slider");
	this.traceSlider = document.getElementById("gog-trace-slider");
	this.colorSlider = document.getElementById("gog-color-slider");
	
	var intervalX = 2000 / (this.gameOfLife.interval + 16) - 3;
	this.speedSlider.slider.setValue(intervalX / 80 * 100);
	this.traceSlider.slider.setValue(this.gameOfLife.colorAgeSize / 255 * 100);
	this.colorSlider.slider.setValue(this.gameOfLife.hueOffset);
	
	this.speedSlider.addEventListener('slideend', function(event) {
		this.gameOfLife.interval = 2000 / (event.detail / 100 * 80 + 3) - 16;
		if (this.gameOfLife.started) {
			this.gameOfLife.toggleGame();
			this.gameOfLife.toggleGame();
		}
	}.bind(this));
	
	this.traceSlider.addEventListener('valuechanged', function(event) {
		this.gameOfLife.colorAgeSize = Math.floor(event.detail / 100 * 254 + 2);
	}.bind(this));
	
	this.colorSlider.addEventListener('valuechanged', function(event) {
		this.gameOfLife.hueOffset = event.detail;
	}.bind(this));
}

Settings.prototype.initSymmetryRadio = function() {
	var symmetryList = document.getElementById("gog-symmetry-container");
	var symmetriesRadios = symmetryList.getElementsByTagName("input");
	
	for (var i = 0; i < symmetriesRadios.length; ++i) {
		var radio = symmetriesRadios[i];
		if (radio.value == this.gameOfLife.drawSymmetry) {
			radio.checked = true;
		}
		radio.addEventListener('change', this.onSymmetrySelect.bind(this));
	}
}

Settings.prototype.onSymmetrySelect = function(event) {
	this.gameOfLife.drawSymmetry = event.target.value;
}

Settings.prototype.onKeyDown = function(event) {
	// Space bar
	if (event.keyCode == 32 && this.gameOfLife) {
		this.gameOfLife.toggleGame();
		event.preventDefault();
	}
}

Settings.prototype.onKeyUp = function(event) {
	// Space bar
	if (event.keyCode == 32 && this.gameOfLife) {
		event.preventDefault();
	}
}

Settings.prototype.onGamePause = function() {
	this.playPauseButton.className = "gog-play-button";
	this.autoHider.setEnabled(false);
}

Settings.prototype.onGameStart = function() {
	this.playPauseButton.className = "gog-pause-button";
	this.autoHider.setEnabled(true);
}

Settings.prototype.onPlayPauseClick = function() {
	if (this.gameOfLife) {
		this.gameOfLife.toggleGame();
	}
}

Settings.prototype.onResetClick = function() {
	if (this.gameOfLife) {
		this.gameOfLife.resetGame();
	}
}

Settings.prototype.onNextPatternClick = function() {
	if (this.gameOfLife) {
		this.gameOfLife.nextPattern();
	}
}

Settings.prototype.onSettingsButtonMouseDown = function() {
	this.togglePanel();
}

Settings.prototype.onFullscreenButtonMouseDown = function() {
	toggleFullscreen();
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