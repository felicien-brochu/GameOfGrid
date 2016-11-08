function AutoHider(element, toHide, timeout, transitionDuration) {
	this.oldCursor = element.style.cursor;
	this.element = element;
	this.toHide = toHide;
	this.enabled = false;
	this.timeoutId1 = null;
	this.timeoutId2 = null;
	this.hidden = false;
	this.timeout = timeout;
	this.transitionDuration = transitionDuration;

	document.addEventListener("mousemove", this.resetTimer.bind(this));
	document.addEventListener("touchmove", this.resetTimer.bind(this));
	document.addEventListener("touchstart", this.resetTimer.bind(this));
}

AutoHider.prototype.setEnabled = function(enabled) {
	if (enabled && !this.enabled) {
		this.start();
		this.enabled = true;
	} else if (!enabled && this.enabled) {
		this.stop();
		this.enabled = false;
	}
}

AutoHider.prototype.start = function() {
	this.timeoutId1 = setTimeout(this.startHiding.bind(this), this.timeout - this.transitionDuration);
}

AutoHider.prototype.stop = function() {
	if (this.timeoutId1) {
		clearTimeout(this.timeoutId1);
		this.timeoutId1 = null;
	}
	if (this.timeoutId2) {
		clearTimeout(this.timeoutId2);
		this.timeoutId2 = null;
	}
	this.element.style.cursor = this.oldCursor;
	this.unhide();
}

AutoHider.prototype.startHiding = function() {
	this.oldCursor = this.element.style.cursor;
	this.element.style.cursor = 'none';
	this.toHide.forEach(function(element) {
		element.style.opacity = 0;
	});
	this.hidden = true;
	this.timeoutId1 = null;
	this.timeoutId2 = setTimeout(this.finishHiding.bind(this), this.transitionDuration);
}

AutoHider.prototype.finishHiding = function() {
	this.toHide.forEach(function(element) {
		element.lastDisplay = element.style.display;
		element.style.display = 'none';
	});
	this.hidden = true;
}

AutoHider.prototype.unhide = function() {
	this.element.style.cursor = this.oldCursor;
	this.toHide.forEach(function(element) {
		element.style.opacity = 1;
		element.style.display = element.lastDisplay;
	});
	this.hidden = false;
}

AutoHider.prototype.resetTimer = function(event) {
	if (this.enabled && !(event.type === "mousemove" && event.movementX == 0 && event.movementY == 0)) {
		this.stop();
		this.start();
	}
}