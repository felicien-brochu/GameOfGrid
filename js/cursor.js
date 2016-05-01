function CursorAutoHider(element, timeout) {
	this.oldCursor = element.style.cursor;
	this.element = element;
	this.enabled = false;
	this.timeoutId = null;
	this.cursorHidden = false;
	this.timeout = timeout;
	
	this.element.addEventListener("mousemove", function(event) {this.onMouseMove(event)}.bind(this));
}

CursorAutoHider.prototype.setEnabled = function(enabled) {
	if (enabled && !this.enabled) {
		this.start();
		this.enabled = true;
	} else if (!enabled && this.enabled) {
		this.stop();
		this.enabled = false;
	}
}

CursorAutoHider.prototype.start = function() {
	this.timeoutId = setTimeout(function() {this.hideCursor()}.bind(this), this.timeout);
}

CursorAutoHider.prototype.stop = function() {
	if (this.cursorHidden) {
		this.element.style.cursor = this.oldCursor;
		this.showCursor();
	} else {
		clearTimeout(this.timeoutId);
	}
}

CursorAutoHider.prototype.hideCursor = function() {
	this.oldCursor = this.element.style.cursor;
	this.element.style.cursor = 'none';
	this.cursorHidden = true;
}

CursorAutoHider.prototype.showCursor = function() {
	this.element.style.cursor = this.oldCursor;
	this.cursorHidden = false;
}

CursorAutoHider.prototype.onMouseMove = function(event) {
	if (this.enabled) {
		this.stop();
		if (this.cursorHidden) {
			this.showCursor();
		}
		this.start();
	}
}