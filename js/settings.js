function Settings(gameOfLife) {
	this.gameOfLife = gameOfLife;
	this.widgetsCanvas = document.getElementById("widgetsCanvas");
	this.shadowCanvas = document.getElementById("shadowCanvas");
	this.panelCanvas = document.getElementById("panelCanvas");
	this.context = this.widgetsCanvas.getContext("2d");
	this.buttons = [];
	this.widgets = [];
	this.buttonWidth = 34;
	this.buttonHeight = 30;
	this.sliders = [];
	this.sprites = [];

	this.widgetsCanvas.isDirty = false;
	this.isShadowDirty = true;
	this.isPanelDirty = false;
	this.rendering = false;
	this.widgetsCanvas.width = window.innerWidth;
	this.widgetsCanvas.height = window.innerHeight;
	this.shadowCanvas.width = window.innerWidth;
	this.shadowCanvas.height = window.innerHeight;
	this.panelCanvas.width = window.innerWidth;
	this.panelCanvas.height = window.innerHeight;
	
	this.panel = new Panel(220, this.panelCanvas, this.widgetsCanvas, this.gameOfLife, true);
	this.widgets = this.widgets.concat(this.panel.sliders);
	
	window.addEventListener("resize", this.onResize.bind(this));
	window.addEventListener("keydown", this.onKeyDown.bind(this));
	this.widgetsCanvas.addEventListener("mousemove", function(event) {this.onMouseMove(event)}.bind(this));
	this.widgetsCanvas.addEventListener("mousedown", function(event) {this.onMouseDown(event)}.bind(this));
	this.widgetsCanvas.addEventListener("mouseup", function(event) {this.onMouseUp(event)}.bind(this));

	this.startRendering();
	this.loadSprites().then(function() {
		this.initButtons();
		this.widgetsCanvas.isDirty = true;
	}.bind(this));
};

Settings.prototype.loadSprite = function(src) {
	return new Promise(function(resolve, reject) {
		var sprite = new Image();
		sprite.onload = function() {
			this.sprites[src] = sprite;
			resolve();
		}.bind(this);
		sprite.src = "img/" + src;
	}.bind(this));
}

Settings.prototype.loadSprites = function() {
	return Promise.all([this.loadSprite("play.png"),
						this.loadSprite("pause.png"),
						this.loadSprite("reset.png"),
						this.loadSprite("shuffle.png"),
						this.loadSprite("settings.png"),
						this.loadSprite("fullscreen.png")]);
}

Settings.prototype.addButton = function(x, y, width, height, image, onMouseDown) {
	var button = new Button(x, y, width, height, image, onMouseDown, this.widgetsCanvas);
	this.buttons.push(button);
	this.widgets.push(button);
	return button;
}

Settings.prototype.initButtons = function() {
	this.fullscreenButton = this.addButton(10, 10, this.buttonWidth, this.buttonHeight, this.sprites["fullscreen.png"], function(){ this.onFullscreenButtonMouseDown(); }.bind(this));
	this.settingsButton = this.addButton(50, 10, this.buttonWidth, this.buttonHeight, this.sprites["settings.png"], function(){ this.onSettingsButtonMouseDown(); }.bind(this));
	this.shuffleButton = this.addButton(90, 10, this.buttonWidth, this.buttonHeight, this.sprites["shuffle.png"], function(){ this.onShuffleClick(); }.bind(this));
	this.resetButton = this.addButton(130, 10, this.buttonWidth, this.buttonHeight, this.sprites["reset.png"], function(){ this.onResetClick(); }.bind(this));
	this.playPauseButton = this.addButton(170, 10, this.buttonWidth, this.buttonHeight, this.sprites["play.png"], function(){ this.onPlayPauseClick(); }.bind(this));
}

Settings.prototype.onResize = function(event) {
	this.widgetsCanvas.width = window.innerWidth;
	this.widgetsCanvas.height = window.innerHeight;
	this.shadowCanvas.width = window.innerWidth;
	this.shadowCanvas.height = window.innerHeight;
	this.panelCanvas.width = window.innerWidth;
	this.panelCanvas.height = window.innerHeight;
	
	this.isShadowDirty = true;
	this.widgetsCanvas.isDirty = true;
	this.isPanelDirty = true;
}

Settings.prototype.onKeyDown = function(event) {
	// Space bar
	if (event.keyCode == 32 && this.gameOfLife) {
		this.gameOfLife.toggleGame();
	}
}

Settings.prototype.onMouseMove = function(event) {	
	var hoverButton = false;
	var hasChanged = false;
	for (var i = 0; i < this.buttons.length; i++) {
		var button = this.buttons[i];
		var hovered = button.isMouseOver(event, this.widgetsCanvas);
		
		hasChanged = hasChanged || hovered !== button.hovered;
		button.hovered = hovered;
				
		if (button.hovered) {
			hoverButton = true;
		}
	}
	
	if (!this.panel.hidden) {
		hasChanged = hasChanged || this.panel.onMouseMove(event);
	}
	
	if (hasChanged) {
		this.widgetsCanvas.isDirty = true;
		if (hoverButton) {
			this.widgetsCanvas.style.cursor = "pointer";
		}
		else {
			this.widgetsCanvas.style.cursor = "default";
		}
	}
	
	if (this.gameOfLife) {
		var dispatchEvent = new MouseEvent('mousemove', {
			clientX: event.clientX,
			clientY: event.clientY
		});
		this.gameOfLife.canvas.dispatchEvent(dispatchEvent);
	}
}

Settings.prototype.onMouseDown = function(event) {
	var eventCatched = false;
	var hasChanged = false;
	for (var i = 0; i < this.buttons.length; i++) {
		var button = this.buttons[i];
		if (button.isMouseOver(event, this.widgetsCanvas)) {
			hasChanged = hasChanged || button.onMouseDown();
			eventCatched = true;
		}
	}
	
	if (!this.panel.hidden && this.panel.isMouseOver(event)) {
		hasChanged = hasChanged || this.panel.onMouseDown(event);
		eventCatched = true;
	}
	
	if (hasChanged) {
		this.widgetsCanvas.isDirty = true;
	}
	
	if (!eventCatched && this.gameOfLife) {
		var dispatchEvent = new MouseEvent('mousedown', {
			clientX: event.clientX,
			clientY: event.clientY
		});
		this.gameOfLife.canvas.dispatchEvent(dispatchEvent);
	}
}

Settings.prototype.onMouseUp = function(event) {
	var eventCatched = false;
	var hasChanged = false;
	
	if (!this.panel.hidden) {
		hasChanged = hasChanged || this.panel.onMouseUp(event);
	}
	
	if (hasChanged) {
		this.widgetsCanvas.isDirty = true;
	}
	
	if (!eventCatched && this.gameOfLife) {
		var dispatchEvent = new MouseEvent('mouseup', {
			clientX: event.clientX,
			clientY: event.clientY
		});
		this.gameOfLife.canvas.dispatchEvent(dispatchEvent);
	}
}

Settings.prototype.onGamePause = function() {
	this.playPauseButton.image = this.sprites["play.png"];
	this.widgetsCanvas.isDirty = true;
}

Settings.prototype.onGameStart = function() {
	this.playPauseButton.image = this.sprites["pause.png"];
	this.widgetsCanvas.isDirty = true;
}

Settings.prototype.startRendering = function() {
	this.rendering = true;
}

Settings.prototype.render = function() {
	if (this.rendering) {
		if (this.widgetsCanvas.isDirty) {
			this.drawWidgets();
		}
		if (this.isShadowDirty) {
			this.drawInnerShadow();
		}
		if (this.isPanelDirty) {
			this.panel.draw();
			this.isPanelDirty = false;
		}
	}
}

Settings.prototype.drawWidgets = function() {
	this.context.clearRect(0, 0, this.widgetsCanvas.width, this.widgetsCanvas.height);
	
	for (var i = 0; i < this.widgets.length; i++) {
		this.widgets[i].draw();
	}
	this.widgetsCanvas.isDirty = false;
}

Settings.prototype.drawInnerShadow = function() {
	var context = this.shadowCanvas.getContext("2d");
	context.shadowBlur = 120;
	context.shadowColor = "#000000";
	context.shadowOffsetY = -20;
	context.shadowOffsetX = 0;
	context.fillRect(-100, -100, this.shadowCanvas.width + 100, 100);
	context.shadowOffsetY = 0;
	context.shadowOffsetX = 0;
	context.fillRect(-100, -100, 100, this.shadowCanvas.height + 100);
	context.shadowOffsetY = -10;
	context.shadowOffsetX = 0;
	context.fillRect(-100, this.shadowCanvas.height, this.shadowCanvas.width + 100, 100);
	context.shadowOffsetY = 0;
	context.shadowOffsetX = 0;
	context.fillRect(this.shadowCanvas.width, -100, 100, this.shadowCanvas.height + 100);
	this.isShadowDirty = false;
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

Settings.prototype.onShuffleClick = function() {
	if (this.gameOfLife) {
		this.gameOfLife.shuffleGame();
	}
}

Settings.prototype.onSettingsButtonMouseDown = function() {
	this.togglePanel();
}

Settings.prototype.onFullscreenButtonMouseDown = function() {
	toggleFullscreen();
}

Settings.prototype.togglePanel = function() {
	this.panel.toggle();
	this.isPanelDirty = true;
}

function Button(rightX, y, width, height, image, onMouseDown, canvas) {
	this.rightX = rightX;
	this.y = y;
	this.width = width;
	this.height = height;
	this.image = image;
	this.onMouseDown = onMouseDown;
	this.widgetsCanvas = canvas;
	this.hovered = false;
}

Button.prototype.getX = function() {
	return this.widgetsCanvas.width - this.rightX - this.width;
}

Button.prototype.isMouseOver = function(event) {
	return event.clientX >= this.getX() &&
	       event.clientX < this.getX() + this.width &&
	       event.clientY >= this.y &&
	       event.clientY < this.y + this.height;
}

Button.prototype.draw = function() {
	var context = this.widgetsCanvas.getContext("2d");
	// if (this.hovered) {
		// context.save();
		// context.clearRect(this.getX(), this.y, this.width, this.height);
		// context.fillStyle = "#BBBBBB";
		// context.strokeStyle = "#BBBBBB";
		// this.fillRoundedCornerRect(context, this.getX(), this.y, this.width, this.height, 8);
		// context.restore();
	// }
	context.save();
	if (!this.hovered) {
		context.globalAlpha = 0.9;
	}
	context.drawImage(this.image, this.getX(), this.y, this.width, this.height);
	context.restore();
}

Button.prototype.fillRoundedCornerRect = function(context, rectX, rectY, rectWidth, rectHeight, cornerRadius) {
	context.lineJoin = "round";
	context.lineWidth = cornerRadius;

	context.save();
	context.shadowBlur = 8;
	context.shadowColor = "rgba(0, 0, 0, 0.3)";
	context.strokeRect(rectX+(cornerRadius/2), rectY+(cornerRadius/2), rectWidth-cornerRadius, rectHeight-cornerRadius);
	context.restore();
	
	context.fillRect(rectX+(cornerRadius/2), rectY+(cornerRadius/2), rectWidth-cornerRadius, rectHeight-cornerRadius);
}

function Panel(width, panelCanvas, widgetsCanvas, gameOfLife, hidden) {
	this.width = width;
	this.panelCanvas = panelCanvas;
	this.widgetsCanvas = widgetsCanvas;
	this.gameOfLife = gameOfLife;
	this.hidden = hidden;
	this.sliders = [];
	
	this.buildSliders();
}

Panel.prototype.buildSliders = function() {
	var sliderX = this.width - 80.5;
	var sliderWidth = 120;
	var sliderHeight = 10;
	var intervalX = 2000 / (this.gameOfLife.interval + 16) - 3;
	this.sliders.push(new Slider(sliderX, 70.5, sliderWidth, sliderHeight, function(){}, function(slider) {
		this.gameOfLife.interval = 2000 / (slider.value + 3) - 16;
		console.log("inter: " + this.gameOfLife.interval);
		if (this.gameOfLife.started) {
			this.gameOfLife.toggleGame();
			this.gameOfLife.toggleGame();
		}
	}.bind(this), 0, 80, intervalX, this.widgetsCanvas, this.hidden));
	this.sliders.push(new Slider(sliderX, 95.5, sliderWidth, sliderHeight, function(slider){
		this.gameOfLife.colorAgeSize = slider.value;
	}.bind(this), function(){}, 0, 255, this.gameOfLife.colorAgeSize, this.widgetsCanvas, this.hidden));
	this.sliders.push(new Slider(sliderX, 120.5, sliderWidth, sliderHeight, function(slider){
		this.gameOfLife.hueOffset = slider.value;
	}.bind(this), function(){}, 0, 100, this.gameOfLife.hueOffset, this.widgetsCanvas, this.hidden));
}

Panel.prototype.toggle = function() {
	this.hidden = !this.hidden;
	
	for (var i = 0, len = this.sliders.length; i < len; i++) {
		this.sliders[i].hidden = this.hidden;
	}
	this.widgetsCanvas.isDirty = true;
}

Panel.prototype.onMouseMove = function(event) {
	var hasChanged = false;
	for (var i = 0; i < this.sliders.length; ++i) {
		hasChanged = hasChanged || this.sliders[i].onMouseMove(event);
	}
	return hasChanged;
}

Panel.prototype.onMouseDown = function(event) {
	var hasChanged = false;
	for (var i = 0; i < this.sliders.length; ++i) {
		hasChanged = hasChanged || this.sliders[i].onMouseDown(event);
	}
	return hasChanged;
}

Panel.prototype.onMouseUp = function(event) {
	var hasChanged = false;
	for (var i = 0; i < this.sliders.length; ++i) {
		hasChanged = hasChanged || this.sliders[i].onMouseUp(event);
	}
	return hasChanged;
}

Panel.prototype.isMouseOver = function(event) {
	return event.clientX >= this.panelCanvas.width - this.width &&
	       event.clientX < this.panelCanvas.width &&
	       event.clientY >= 0 &&
	       event.clientY < this.panelCanvas.height;
}

Panel.prototype.draw = function() {
	var context = this.panelCanvas.getContext("2d");
	context.clearRect(0, 0, this.panelCanvas.width, this.panelCanvas.height);
	if (!this.hidden) {
		context.shadowBlur = 60;
		context.shadowColor = "rgba(0, 0, 0, 0.8)";
		context.fillStyle = "rgba(0, 0, 0, 0.5)";
		context.fillRect(this.panelCanvas.width - this.width, 0, this.panelCanvas.width, this.panelCanvas.height);
		context.font = "12px Verdana";
		context.fillStyle = "white";
		context.fillText("Speed", this.panelCanvas.width - this.width + 20, 80);
		context.fillText("Trace", this.panelCanvas.width - this.width + 24, 105);
		context.fillText("Hue", this.panelCanvas.width - this.width + 28, 130);
	}
}

function Slider(rightX, y, width, height, onSlide, onSlideEnd, min, max, value, canvas, hidden) {
	this.rightX = rightX;
	this.y = y;
	this.width = width;
	this.height = height;
	this.onSlide = onSlide;
	this.onSlideEnd = onSlideEnd;
	this.min = min;
	this.max = max;
	this.value = value;
	this.widgetsCanvas = canvas;
	this.hidden = hidden;
}

Slider.prototype.getX = function() {
	return this.widgetsCanvas.width - this.rightX;
}

Slider.prototype.onMouseDown = function(event) {
	var hasChanged = false;
	if (this.isMouseOver(event)) {
		this.sliding = true;
		var x = event.clientX;
		var buttonWidth = this.height - 3;
		var valueWidth = this.width - buttonWidth - 3;
		var startX = this.getX() + 1.5 + (buttonWidth / 2);
		var endX = this.getX() + this.width - 1.5 - (buttonWidth / 2);
		
		if (x < startX) {
			x = startX;
		}
		
		if (x > endX) {
			x = endX;
		}
		var newValue = this.min + ((x - startX) / valueWidth) * (this.max - this.min);
		if (this.value != newValue) {
			hasChanged = true;
			this.onSlide(this);
			this.value = newValue;
		}
	}
	
	return hasChanged;
}

Slider.prototype.onMouseUp = function(event) {
	var hasChanged = false;
	if (this.sliding) {
		this.sliding = true;
		var x = event.clientX;
		var buttonWidth = this.height - 3;
		var valueWidth = this.width - buttonWidth - 3;
		var startX = this.getX() + 1.5 + (buttonWidth / 2);
		var endX = this.getX() + this.width - 1.5 - (buttonWidth / 2);
		
		if (x < startX) {
			x = startX;
		}
		
		if (x > endX) {
			x = endX;
		}
		var newValue = this.min + ((x - startX) / valueWidth) * (this.max - this.min);
		if (this.value != newValue) {
			hasChanged = true;
			this.value = newValue;
		}
		this.sliding = false;
		this.onSlideEnd(this);
	}
	return hasChanged;
}

Slider.prototype.onMouseMove = function(event) {
	var hasChanged = false;
	if (this.sliding) {
		this.sliding = true;
		var x = event.clientX;
		var buttonWidth = this.height - 3;
		var valueWidth = this.width - buttonWidth - 3;
		var startX = this.getX() + 1.5 + (buttonWidth / 2);
		var endX = this.getX() + this.width - 1.5 - (buttonWidth / 2);
		
		if (x < startX) {
			x = startX;
		}
		
		if (x > endX) {
			x = endX;
		}
		var newValue = this.min + ((x - startX) / valueWidth) * (this.max - this.min);
		if (this.value != newValue) {
			hasChanged = true;
			this.onSlide(this);
			this.value = newValue;
		}
	}
	return hasChanged;
}

Slider.prototype.isMouseOver = function(event) {
	return event.clientX >= this.getX() &&
	       event.clientX < this.getX() + this.width &&
	       event.clientY >= this.y &&
	       event.clientY < this.y + this.height;
}

Slider.prototype.draw = function() {
	if (!this.hidden) {
		var context = this.widgetsCanvas.getContext("2d");
		context.save();
		// frame
		context.lineJoin = "miter";
		context.lineWidth = 1;
		context.strokeStyle = "#FFFFFF";
		context.moveTo(this.getX(), this.y);
		context.lineTo(this.getX(), this.y + this.height);
		context.moveTo(this.getX(), this.y + this.height);
		context.lineTo(this.getX() + this.width, this.y + this.height);
		context.moveTo(this.getX() + this.width, this.y + this.height);
		context.lineTo(this.getX() + this.width, this.y);
		context.lineTo(this.getX() + this.width, this.y);
		context.lineTo(this.getX(), this.y);
		context.stroke();
		
		// Button
		context.fillStyle = "#FFFFFF";
		var buttonHeight = this.height - 3;
		var buttonWidth = buttonHeight;
		var valueWidth = this.width - buttonWidth - 3;
		var buttonX = this.getX() + 1.5 + ((this.value - this.min) / (this.max - this.min)) * valueWidth;
		var buttonY = this.y + 1.5;
		context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
		context.restore();
	}
}