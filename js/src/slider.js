function getLeft(element) {
	for (var left = 0; element != null; left += element.offsetLeft, element = element.offsetParent);
	return left;
}

Slider.prototype.computeValue = function(event) {
	var x = event.pageX - getLeft(this.element);
	var minX = 2 + this.button.offsetWidth / 2,
		maxX = this.element.offsetWidth - this.button.offsetWidth / 2 - 2;

	if (x < minX) {
		x = minX;
	}
	if (x > maxX) {
		x = maxX;
	}

	return (x - minX) / (this.element.offsetWidth - 4 - this.button.offsetWidth) * 100;
}

Slider.prototype.onMouseDown = function(event) {
	this.sliding = true;
	var newValue = this.computeValue(event);
	var event = new CustomEvent('slidestart', { 'detail': newValue });
	this.element.dispatchEvent(event);
	if (this.value != newValue) {
		this.setValue(newValue, true);
	}
}

Slider.prototype.onMouseUp = function(event) {
	if (this.sliding) {
		var newValue = this.computeValue(event);
		if (this.value != newValue) {
			this.setValue(newValue, true);
		}
		this.sliding = false;
		var event = new CustomEvent('slideend', { 'detail': newValue });
		this.element.dispatchEvent(event);
	}
}

Slider.prototype.onMouseMove = function(event) {
	if (this.sliding) {
		var newValue = this.computeValue(event);
		if (this.value != newValue) {
			this.setValue(newValue, true);
		}
	}
}

Slider.prototype.setValue = function(newValue, fromEvent) {
	this.value = newValue;
	this.button.style.marginLeft = (newValue / 100) * (this.element.offsetWidth - 4 - this.button.offsetWidth);
	if (fromEvent) {
		var event = new CustomEvent('valuechanged', { 'detail': newValue });
		this.element.dispatchEvent(event);
	}
}

Slider.prototype.onTouch = function(event) {
	var type = null;
	switch (event.type) {
	case "touchstart":
		type = "mousedown";
		break;
	case "touchmove":
		type = "mousemove";
		break;
	case "touchend":
		type = "mouseup";
		break;
	}

	for (var i = 0, length = event.changedTouches.length; i < length; ++i) {
		var touch = event.changedTouches[i];
		var mouseEvent = new MouseEvent(type, {
				bubbles: true,
				cancelable: true,
				view: event.target.ownerDocument.defaultView,
				screenX: touch.screenX,
				screenY: touch.screenY,
				clientX: touch.clientX,
				clientY: touch.clientY,
				movementX: 1,
				movementY: 1,
				ctrlKey: event.ctrlKey,
				altKey: event.altKey,
				shiftKey: event.shiftKey,
				metaKey: event.metaKey,
				button: 0});

		if (type === "mousedown") {
			this.onMouseDown(mouseEvent);
		} else if (type === "mouseup") {
			this.onMouseUp(mouseEvent);
		} else if (type === "mousemove") {
			this.onMouseMove(mouseEvent);
		}
	}
}

function Slider(element) {
	this.element = element;
	this.sliding = false;
	this.value = 50;

	this.button = document.createElement("div");
	this.button.className = "gog-slider-button";

	element.addEventListener('mousedown', this.onMouseDown.bind(this));
	document.addEventListener('mouseup', this.onMouseUp.bind(this));
	document.addEventListener('mousemove', this.onMouseMove.bind(this));
	element.addEventListener("touchstart", this.onTouch.bind(this));
	element.addEventListener("touchmove", this.onTouch.bind(this));
	element.addEventListener("touchend", this.onTouch.bind(this));

	element.appendChild(this.button);
	element.slider = this;
}


var sliders = document.getElementsByClassName("gog-slider");

for (var i = 0; i < sliders.length; ++i) {
	new Slider(sliders[i]);
}