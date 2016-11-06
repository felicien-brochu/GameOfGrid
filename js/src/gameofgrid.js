function GameOfGrid() {
	this.started = false;
	this.gridHeight = 100;
	this.gridWidth = 100;
	this.cellSize = 8;
	this.interval = 100;
	this.colorAgeSize = 100;
	this.hueOffset = 55;

	this.grid = [];
	this.history = new History();
	this.newGrid = [];
	this.dirtyCells = [];
	this.cellColors = [];
	this.drawMode = "none";
	this.lastDrawX = 0;
	this.lastDrawY = 0;
	this.drawSymmetry = 0;
	this.drawSymmetries = ["none", "vertical", "horizontal", "double", "central"];

	this.timerId;
	this.rendering = false;
	this.isDirty = false;
	this.isAllDirty = false;
	this.isShadowDirty = true;
	this.webGLEnabled = false;

	this.settings = null;
	this.shadowCanvas = document.getElementById("gog-shadow-canvas");
	this.canvas = document.getElementById("gog-game-of-grid-canvas");

	this.canvas.width = window.innerWidth;
	this.canvas.height = window.innerHeight;

	this.shadowCanvas.width = window.innerWidth;
	this.shadowCanvas.height = window.innerHeight;

	this.webGLEnabled = this.initWebGL() != null;
	if (this.webGLEnabled) {
		console.log("Rendering with WebGL");
		GameOfGrid.prototype.renderFrame = this.renderWebGL;
	}
	else {
		console.log("WebGL is not available on this browser: rendering with Context2D");
		GameOfGrid.prototype.renderFrame = this.renderContext2D;
	}
	window.addEventListener("resize", this.onResize.bind(this));
	window.addEventListener("mouseout", this.onMouseOut.bind(this));

	this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
	this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
	this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
	this.canvas.addEventListener("touchstart", this.onTouch.bind(this));
	this.canvas.addEventListener("touchmove", this.onTouch.bind(this));
	this.canvas.addEventListener("touchend", this.onTouch.bind(this));
	this.canvas.addEventListener("selectstart", function(e) { e.preventDefault(); });

	this.initFrame();
	this.startRendering();
}

GameOfGrid.prototype.registerSettings = function(settings) {
	this.settings = settings;
	this.history.listener = settings;
}

GameOfGrid.prototype.initWebGL = function() {
	try {
		this.gl = this.canvas.getContext("webgl");
	}
	catch (x) {
		this.gl = null;
	}

	if (this.gl == null) {
		try {
			this.gl = this.canvas.getContext("experimental-webgl");
		}
		catch (x) {
			this.gl = null;
		}
	}

	if (!this.gl) {
		return this.gl;
	}

	this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	this.gl.clearColor(0.8, 0.8, 0.8, 1);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT);

	var v = document.getElementById("vertex").firstChild.nodeValue;
	var f = document.getElementById("fragment").firstChild.nodeValue;

	var vs = this.gl.createShader(this.gl.VERTEX_SHADER);
	this.gl.shaderSource(vs, v);
	this.gl.compileShader(vs);

	var fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
	this.gl.shaderSource(fs, f);
	this.gl.compileShader(fs);

	this.program = this.gl.createProgram();
	this.gl.attachShader(this.program, vs);
	this.gl.attachShader(this.program, fs);
	this.gl.linkProgram(this.program);

	if (!this.gl.getShaderParameter(vs, this.gl.COMPILE_STATUS)) {
		console.log(this.gl.getShaderInfoLog(vs));
	}

	if (!this.gl.getShaderParameter(fs, this.gl.COMPILE_STATUS)) {
		console.log(this.gl.getShaderInfoLog(fs));
	}

	if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
		console.log(this.gl.getProgramInfoLog(program));
	}

	return this.gl;
}

GameOfGrid.prototype.initFrame = function() {
	this.gridWidth = Math.ceil(this.canvas.width / this.cellSize);
	this.gridHeight = Math.ceil(this.canvas.height / this.cellSize);
	this.resetFrame();
}

GameOfGrid.prototype.resetFrame = function() {
	for (var i = 0, len = this.gridHeight * this.gridWidth; i < len; ++i) {
		this.grid[i] = 0;
	}
	this.isAllDirty = true;
	this.isDirty = true;
}

GameOfGrid.prototype.resetGame = function() {
	if (!this.isReset()) {
		if (this.started) {
			this.toggleGame();
		}
		this.resetFrame();
		this.history.put([], 0, 0);
	}
}

GameOfGrid.prototype.generatePattern = function(generator) {
	if (this.started) {
		this.toggleGame();
	}
	generator(this.grid, this.gridWidth, this.gridHeight);
	this.saveHistory();
	this.isAllDirty = true;
	this.isDirty = true;
}

GameOfGrid.prototype.onResize = function() {
	var oldGridWidth = this.gridWidth;
	var oldGridHeight = this.gridHeight;
	this.gridWidth = Math.ceil(window.innerWidth / this.cellSize);
	this.gridHeight = Math.ceil(window.innerHeight / this.cellSize);

	if (this.gridWidth < oldGridWidth) {
		this.gridWidth = oldGridWidth;
	}
	if (this.gridHeight < oldGridHeight) {
		this.gridHeight = oldGridHeight;
	}
	if (this.canvas.width < window.innerWidth || this.canvas.height < window.innerHeight) {
		for (var i = 0, len = this.gridWidth * this.gridHeight; i < len; ++i) {
			var x = Math.floor(i % this.gridWidth),
				y = Math.floor(i / this.gridWidth);
			if (x < oldGridWidth && y < oldGridHeight) {
				this.newGrid[i] = this.grid[y * oldGridWidth + x];
			}
			else {
				this.newGrid[i] = 0;
			}
		}
		var tempGrid = this.grid;
		this.grid = this.newGrid;
		this.newGrid = tempGrid;
	}

	this.canvas.width = window.innerWidth;
	this.canvas.height = window.innerHeight;
	if (this.webGLEnabled) {
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	}
	this.isAllDirty = true;
	this.isDirty = true;

	this.shadowCanvas.width = window.innerWidth;
	this.shadowCanvas.height = window.innerHeight;

	this.isShadowDirty = true;
}

GameOfGrid.prototype.onMouseOut = function() {
	if (this.drawMode != "none") {
		this.saveHistory();
	}
	this.drawMode = "none";
}

GameOfGrid.prototype.onMouseDown = function(event) {
	if (!this.started) {
		var x = event.clientX,
			y = event.clientY,
			gridX = Math.floor(x / this.cellSize),
			gridY = Math.floor(y / this.cellSize);

		this.lastDrawX = x;
		this.lastDrawY = y;

		if (this.grid[gridY * this.gridWidth + gridX] === -1) {
			this.drawMode = "erase";
		}
		else {
			this.drawMode = "draw";
		}
		this.applyBrush(x, y);
	}
}

GameOfGrid.prototype.onMouseUp = function(event) {
	this.drawMode = "none";
	this.saveHistory();
}

GameOfGrid.prototype.onMouseMove = function(event) {
	if (!this.started && this.drawMode != "none") {
		this.applyBrush(event.clientX, event.clientY);
	}
}

GameOfGrid.prototype.onTouch = function(event) {
	if (!this.started) {
		event.preventDefault();

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
					ctrlKey: event.ctrlKey,
					altKey: event.altKey,
					shiftKey: event.shiftKey,
					metaKey: event.metaKey,
					button: 0});
			event.target.dispatchEvent(mouseEvent);
		}
	}
}

GameOfGrid.prototype.applyBrush = function(x, y) {
	var drawValue = this.drawMode === "draw" ? -1 : 0;
	var symmetry = this.drawSymmetries[this.drawSymmetry];

	var step = 0.5;
	var dx = x - this.lastDrawX,
		dy = y - this.lastDrawY;

	if (Math.abs(dx) <= Math.abs(dy)) {
		if (dy == 0) {
			dx = 0
		} else {
			dx = dx / (Math.abs(dy) / step);
		}
		dy = dy < 0 ? -step : step;
	} else {
		dy = dy / (Math.abs(dx) / step);
		dx = dx < 0 ? -step : step;
	}

	var lastGridX = -1,
		lastGridY = -1;
	for (var i = 0, deltaX = Math.abs(x - this.lastDrawX), deltaY = Math.abs(y - this.lastDrawY); Math.abs(i * dx) <= deltaX && Math.abs(i * dy) <= deltaY; i++) {
		var gridX = (this.lastDrawX + i * dx) / this.cellSize,
			gridY = (this.lastDrawY + i * dy) / this.cellSize;

		if (lastGridX == gridX && lastGridY == gridY) {
			continue;
		}
		var coords = Math.floor(gridY) * this.gridWidth + Math.floor(gridX);
		this.grid[coords] = drawValue;
		this.dirtyCells.push(coords);

		var symmetryX = gridX + 1e-7, symmetryY = gridY + 1e-7;
		
		// Apply symmetry
		if (symmetry === "horizontal" || symmetry === "double") {
			coords = Math.floor(this.gridHeight - symmetryY) * this.gridWidth + Math.floor(symmetryX);
			this.grid[coords] = drawValue;
			this.dirtyCells.push(coords);
		}
		if (symmetry === "vertical" || symmetry === "double") {
			coords = Math.floor(symmetryY) * this.gridWidth + Math.floor(this.gridWidth - symmetryX);
			this.grid[coords] = drawValue;
			this.dirtyCells.push(coords);
		}
		if (symmetry === "central" || symmetry === "double") {
			coords = Math.floor(this.gridHeight - symmetryY) * this.gridWidth + Math.floor(this.gridWidth - symmetryX);
			this.grid[coords] = drawValue;
			this.dirtyCells.push(coords);
		}
		lastGridX = gridX;
		lastGridY = gridY;
	}

	this.isDirty = true;
	this.lastDrawX = x;
	this.lastDrawY = y;
}

GameOfGrid.prototype.toggleGame = function(dispatchEvent) {
	if (dispatchEvent === undefined) {
		dispatchEvent = true;
	}
	if (this.started) {
		clearInterval(this.timerId);
		if (dispatchEvent && this.settings) {
			this.settings.onGamePause();
			this.saveHistory();
		}
		this.started = false;
	} else if (!this.isReset()) {
		this.bringTheChosenOnesToLife();
		this.nextStep();
		this.history.deleteFuture();
		this.timerId = setInterval(function() {this.nextStep()}.bind(this), this.interval);
		if (dispatchEvent && this.settings) {
			this.settings.onGameStart();
		}
		this.started = true;
	}
}

GameOfGrid.prototype.setInterval = function(interval) {
	this.interval = interval;
	if (this.started) {
		this.toggleGame(false);
		this.toggleGame(false);
	}
}

GameOfGrid.prototype.setColorAgeSize = function(colorAgeSize) {
	this.colorAgeSize = colorAgeSize;
	if (!this.started || this.interval > 40) {
		this.isDirty = true;
		this.isAllDirty = true;
	}
}

GameOfGrid.prototype.setHueOffset = function(hueOffset) {
	this.hueOffset = hueOffset;
	if (!this.started || this.interval > 40) {
		this.isDirty = true;
		this.isAllDirty = true;
	}
}

GameOfGrid.prototype.bringTheChosenOnesToLife = function() {
	for (var i = 0, len = this.gridHeight * this.gridWidth; i < len; i++) {
		if (this.grid[i] === -1) {
			this.grid[i] = 1;
			this.dirtyCells.push(i);
		}
	}
	this.isDirty = true;
}

GameOfGrid.prototype.nextStep = function() {
	for (var i = 0, len = this.gridHeight * this.gridWidth; i < len; ++i) {
		var neighborsCount = this.countNeighbors(i);
		if (this.grid[i] === 1) {
			this.isDirty = true;
			this.dirtyCells.push(i);
			if (neighborsCount < 2 || neighborsCount > 3) {
				this.newGrid[i] = 2;
			}
			else {
				this.newGrid[i] = 1;
			}
		}
		else if (this.grid[i] > 1) {
			this.isDirty = true;
			this.dirtyCells.push(i);
			if (neighborsCount === 3) {
				this.newGrid[i] = 1;
			}
			else if (this.grid[i] > 255) {
				this.newGrid[i] = 0;
			}
			else {
				this.newGrid[i] = this.grid[i] + 1;
			}
		}
		else {
			if (neighborsCount === 3) {
				this.isDirty = true;
				this.dirtyCells.push(i);
				this.newGrid[i] = 1;
			}
			else {
				this.newGrid[i] = 0;
			}
		}
	}
	var tempGrid = this.grid;
	this.grid = this.newGrid;
	this.newGrid = tempGrid;
}

GameOfGrid.prototype.startRendering = function() {
	this.rendering = true;
}

GameOfGrid.prototype.render = function() {
	if (this.rendering) {
		if (this.isDirty) {
			this.renderFrame();
		}
		if (this.isShadowDirty) {
			this.drawInnerShadow();
		}
	}
}

GameOfGrid.prototype.drawInnerShadow = function() {
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

GameOfGrid.prototype.renderContext2D = function() {
	var width = this.cellSize - 1;
	var context = this.canvas.getContext("2d");
	var visibleWidth = (this.canvas.width / this.cellSize) | 0;
	if (this.canvas.width % this.cellSize > 0) {
		visibleWidth++;
	}
	var visibleHeight = (this.canvas.height / this.cellSize) | 0;
	if (this.canvas.height % this.cellSize > 0) {
		visibleHeight++;
	}

	if (this.isAllDirty) {
		for (var i = 0, len = this.gridWidth * this.gridHeight; i < len; ++i) {
			var x = Math.floor(i % this.gridWidth);
			var y = Math.floor(i / this.gridWidth);

			context.clearRect(x * this.cellSize, y * this.cellSize, width, width);
			var color = this.computeColor(this.grid[y * this.gridWidth + x]);
			var alpha = color[3] / 255;
			color[0] = (color[0] * alpha + 204 * (1 - alpha)) | 0;
			color[1] = (color[1] * alpha + 204 * (1 - alpha)) | 0;
			color[2] = (color[2] * alpha + 204 * (1 - alpha)) | 0;
			context.fillStyle = "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";
			context.fillRect(x * this.cellSize, y * this.cellSize, width, width);
		}
		this.isAllDirty = false;
	}
	else {
		for (var i = 0, len = this.dirtyCells.length; i < len; ++i) {
			var index = this.dirtyCells[i];
			var x = (index % this.gridWidth) | 0;
			var y = (index / this.gridWidth) | 0;
			if (x < visibleWidth && y < visibleHeight) {
				context.clearRect(x * this.cellSize, y * this.cellSize, width, width);
				var color = this.computeColor(this.grid[index]);
				var alpha = color[3] / 255;
				color[0] = (color[0] * alpha + 204 * (1 - alpha)) | 0;
				color[1] = (color[1] * alpha + 204 * (1 - alpha)) | 0;
				color[2] = (color[2] * alpha + 204 * (1 - alpha)) | 0;
				context.fillStyle = "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";
				context.fillRect(x * this.cellSize, y * this.cellSize, width, width);
			}
		}
	}
	this.isDirty = false;
	this.dirtyCells = [];
}

GameOfGrid.prototype.renderWebGL = function() {
	var vertices = [];
	var gl = this.gl;

	var visibleWidth = (this.canvas.width / this.cellSize) | 0;
	if (this.canvas.width % this.cellSize > 0) {
		visibleWidth++;
	}
	var visibleHeight = (this.canvas.height / this.cellSize) | 0;
	if (this.canvas.height % this.cellSize > 0) {
		visibleHeight++;
	}
	if (this.isAllDirty) {
		this.cellColors = new Uint8Array(this.gridWidth * this.gridHeight * 4);
		for (var i = 0, len = visibleWidth * visibleHeight; i < len; ++i) {
			var x = (i % this.gridWidth) | 0;
			var y = (i / this.gridWidth) | 0;
			var color = this.computeColor(this.grid[y * this.gridWidth + x]);
			this.cellColors[(y * visibleWidth + x)*4]     = color[0];
			this.cellColors[(y * visibleWidth + x)*4 + 1] = color[1];
			this.cellColors[(y * visibleWidth + x)*4 + 2] = color[2];
			this.cellColors[(y * visibleWidth + x)*4 + 3] = color[3];
		}
	}
	else {
		for (var i = 0, len = this.dirtyCells.length; i < len; ++i) {
			var index = this.dirtyCells[i];
			var x = (index % this.gridWidth) | 0;
			var y = (index / this.gridWidth) | 0;
			if (x < visibleWidth && y < visibleHeight) {
				var color = this.computeColor(this.grid[index]);
				this.cellColors[(y * visibleWidth + x)*4]     = color[0];
				this.cellColors[(y * visibleWidth + x)*4 + 1] = color[1];
				this.cellColors[(y * visibleWidth + x)*4 + 2] = color[2];
				this.cellColors[(y * visibleWidth + x)*4 + 3] = color[3];
			}
		}
	}

	var vertices = new Float32Array([
		-1, -1,   -1,  1,   1, -1,
		-1,  1,    1, -1,   1,  1
	]);
	var vbuffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

	var itemSize = 2;
	var numItems = vertices.length / itemSize;

	this.gl.useProgram(this.program);

	this.program.pixWidth = this.gl.getUniformLocation(this.program, "pixWidth");
	this.gl.uniform1f(this.program.pixWidth, this.cellSize);

	this.program.pixHeight = this.gl.getUniformLocation(this.program, "pixHeight");
	this.gl.uniform1f(this.program.pixHeight, this.cellSize);

	this.program.resolution = this.gl.getUniformLocation(this.program, "resolution");
	this.gl.uniform2fv(this.program.resolution, [this.canvas.width, this.canvas.height]);

	var texture = gl.createTexture();
	this.program.cellColors = this.gl.getUniformLocation(this.program, "cellColors");
	this.gl.activeTexture(this.gl.TEXTURE0);
	this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, visibleWidth, visibleHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.cellColors);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	this.gl.uniform1i(this.program.cellColors, 0);

	this.program.aVertexPosition = this.gl.getAttribLocation(this.program, "aVertexPosition");
	this.gl.enableVertexAttribArray(this.program.aVertexPosition);
	this.gl.vertexAttribPointer(this.program.aVertexPosition, itemSize, this.gl.FLOAT, false, 0, 0);

	this.gl.clearColor(0.8, 0.8, 0.8, 1);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT);
	this.gl.drawArrays(this.gl.TRIANGLES, 0, numItems);

	if (this.isAllDirty) {
		this.isAllDirty = false;
	}

	this.isDirty = false;
	this.dirtyCells = [];
}

GameOfGrid.prototype.computeColor = function(age) {
	if (age === 0 || age >= this.colorAgeSize) {
		return [204, 204, 204, 255];
	}
	else if (age === -1) {
		return [119, 204, 119, 255];
	}
	else {
		var r, g, b;
		var hue;
		if (age == 1) {
			hue = 0;
		}
		else {
			hue = (((age - 1) % this.colorAgeSize) / this.colorAgeSize) * 0.7 + 0.3;
		}

		var opacity;
		if (age == 1) {
			opacity = 1;
		}
		else {
			opacity = 1 - (((age % this.colorAgeSize) / this.colorAgeSize) * 0.5) - 0.1;
		}
		var epsilon = 1e-3;
		r = hue * 2 * Math.PI + (this.hueOffset / 100.) * (2 * Math.PI);
		g = (hue * 2 * Math.PI + Math.PI / 2) % (2 * Math.PI) + (this.hueOffset / 100.) * (2 * Math.PI);
		b = (hue * 2 * Math.PI + Math.PI - epsilon) % (2 * Math.PI) + (this.hueOffset / 100.) * (2 * Math.PI);

		r = ((Math.cos(r) + 1) / 2 * 255) | 0;
		g = ((Math.cos(g) + 1) / 2 * 210) | 0;
		b = ((Math.cos(b) + 1) / 2 * 230) | 0;

		return [r, g, b, opacity * 255];
	}
}

GameOfGrid.prototype.countNeighbors = function(i) {
	var x = Math.floor(i % this.gridWidth);
	var y = Math.floor(i / this.gridWidth);
	var upX = x - 1 < 0 ? this.gridWidth - 1 : x - 1;
	var downX = x + 1 > this.gridWidth - 1 ? 0 : x + 1;
	var upY = y - 1 < 0 ? this.gridHeight - 1 : y - 1;
	var downY = y + 1 > this.gridHeight - 1 ? 0 : y + 1;

	var xs = [upX, x, downX];
	var ys = [upY, y, downY];
	var count = 0;

	for (i = 0; i < 3; i++) {
		for (j = 0; j < 3; j++) {
			if (xs[j] != x || ys[i] != y) {
				count += this.grid[ys[i] * this.gridWidth + xs[j]] === 1 ? 1 : 0;
			}
		}
	}

	return count;
}

GameOfGrid.prototype.saveHistory = function() {
	this.history.put(this.grid, this.gridWidth, this.gridHeight);
}

GameOfGrid.prototype.undo = function() {
	if (this.hasToUndo()) {
		if (this.started) {
			this.toggleGame();
		}
		var grid = this.history.undo();
		this.applyGrid(grid.grid, grid.width, grid.height);
	}
}

GameOfGrid.prototype.hasToUndo = function() {
	return this.history.hasToUndo();
}

GameOfGrid.prototype.redo = function() {
	if (this.hasToRedo()) {
		var grid = this.history.redo();
		this.applyGrid(grid.grid, grid.width, grid.height);
		if (this.started) {
			this.toggleGame();
		}
	}
}

GameOfGrid.prototype.hasToRedo = function() {
	return this.history.hasToRedo();
}

GameOfGrid.prototype.isReset = function() {
	return this.history.isLastEmpty();
}

GameOfGrid.prototype.applyGrid = function(grid, width, height) {
	for (var i = 0, len = this.gridWidth * this.gridHeight; i < len; ++i) {
		var x = Math.floor(i % this.gridWidth);
		var y = Math.floor(i / this.gridWidth);
		
		if (x < width && y < height) {
			this.grid[i] = grid[y * width + x];
		} else {
			this.grid[i] = 0;
		}
	}
	this.isAllDirty = true;
	this.isDirty = true;
}

function History(listener) {
	this.history = [new Grid([], 0, 0)];
	this.currentGrid = -1;
	this.size = 0;
	this.maxSize = 18 * 1024 * 1024 / 8; //< 18 Mo max of history
	this.listener = listener;
}

History.prototype.put = function(grid, width, height) {
	if (this.currentGrid < 0) {
		this.currentGrid++;
	}
	
	this.deleteFuture();
	
	this.history.push(new Grid(grid.slice(), width, height));
	this.size += grid.length;
	this.currentGrid++;
	
	if (this.size > this.maxSize) {		
		var toDelete = 0;
		for (var i = 1; i < this.history.length && this.size > this.maxSize; i++) {
			this.size -= this.history[i].grid.length;
			toDelete = i;
		}
		this.history.splice(1, toDelete);
		this.currentGrid -= toDelete;
	}
	this.onChange();
}

History.prototype.deleteFuture = function() {
	if (this.currentGrid < this.history.length - 1) {
		for (var i = this.currentGrid + 1; i < this.history.length; ++i) {
			this.size -= this.history[i].grid.length;
		}
		this.history = this.history.slice(0, this.currentGrid + 1);
		this.onChange();
	}
}

History.prototype.undo = function() {
	if (this.currentGrid < 0) {
		throw new NothingToUndoException();
	}
	
	this.currentGrid--;
	this.onChange();
	
	return this.history[this.currentGrid];
}

History.prototype.hasToUndo = function() {
	return this.currentGrid > 0;
}

History.prototype.redo = function() {
	if (this.currentGrid == this.history.length - 1) {
		throw new NothingToRedoException();
	}
	
	this.currentGrid++;
	this.onChange();
	
	return this.history[this.currentGrid];
}

History.prototype.hasToRedo = function() {
	return this.currentGrid < this.history.length - 1;
}

History.prototype.isLastEmpty = function() {
	return this.currentGrid < 0 || this.history[this.currentGrid].grid.length == 0;
}

History.prototype.onChange = function() {
	if (this.listener) {
		this.listener.onHistoryChange();
	}
}

function Grid(grid, width, height) {
	this.grid = grid;
	this.width = width;
	this.height = height;
}

function NothingToUndoException() {}
function NothingToRedoException() {}