function GameOfLife() {
	this.started = false;
	this.gridHeight = 100;
	this.gridWidth = 100;
	this.cellSize = 8;
	this.interval = 100;
	this.colorAgeSize = 100;
	this.hueOffset = 0;
	
	this.grid = [];
	this.newGrid = [];
	this.dirtyCells = [];
	this.cellColors = [];
	
	this.timerId;
	this.rendering = false;
	this.isDirty = false;
	this.isAllDirty = false;
	this.webGLEnabled = false;
	
	this.settings = null;
	this.canvas = document.getElementById("gameOfLifeCanvas");

	this.canvas.width = window.innerWidth; //document.width is obsolete
	this.canvas.height = window.innerHeight; //document.height is obsolete
	
	this.webGLEnabled = this.initWebGL() != null;
	if (this.webGLEnabled) {
		console.log("Rendering with WebGL");
		GameOfLife.prototype.renderFrame = this.renderWebGL;
	}
	else {
		console.log("WebGL is not available on this browser: rendering with Context2D");
		GameOfLife.prototype.renderFrame = this.renderContext2D;
	}
	window.addEventListener("resize", function(event) { this.onResize(); }.bind(this));

	this.canvas.addEventListener("mousedown", function(event) {this.onCellClick(event);}.bind(this));

	this.initFrame();
	this.startRendering();
}

GameOfLife.prototype.registerSettings = function(settings) {
	this.settings = settings;
}

GameOfLife.prototype.initWebGL = function() {
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

GameOfLife.prototype.initFrame = function() {
	this.gridWidth = Math.floor(this.canvas.width / this.cellSize) + 1;
	this.gridHeight = Math.floor(this.canvas.height / this.cellSize) + 1;
	for (var i = 0, len = this.gridHeight * this.gridWidth; i < len; ++i) {
		this.grid[i] = 0;
	}
	this.isAllDirty = true;
	this.isDirty = true;
}

GameOfLife.prototype.resetGame = function() {
	if (this.started) {
		this.toggleGame();
	}
	this.initFrame();
}

GameOfLife.prototype.shuffleGame = function() {
	if (this.started) {
		this.toggleGame();
	}
	this.gridWidth = Math.floor(this.canvas.width / this.cellSize) + 1;
	this.gridHeight = Math.floor(this.canvas.height / this.cellSize) + 1;
	for (var i = 0, len = this.gridHeight * this.gridWidth; i < len; ++i) {
		
		this.grid[i] = Math.random() > 0.1 ? 0 : -1;
	}
	this.isAllDirty = true;
	this.isDirty = true;
}

GameOfLife.prototype.onResize = function() {
	var oldGridWidth = this.gridWidth;
	var oldGridHeight = this.gridHeight;
	this.gridWidth = Math.floor(window.innerWidth / this.cellSize) + 1;
	this.gridHeight = Math.floor(window.innerHeight / this.cellSize) + 1;
	
	if (this.gridWidth < oldGridWidth) {
		this.gridWidth = oldGridWidth;
	}
	if (this.gridHeight < oldGridHeight) {
		this.gridHeight = oldGridHeight;
	}
	if (this.canvas.width < window.innerWidth || this.canvas.height < window.innerHeight) {
		for (var i = 0, len = this.gridWidth * this.gridHeight; i < len; ++i) {
			var x = Math.floor(i % this.gridWidth);
			var y = Math.floor(i / this.gridWidth);
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
}

GameOfLife.prototype.onCellClick = function(event) {
	if (!this.started) {
		var x = Math.floor(event.clientX / this.cellSize);
		var y = Math.floor(event.clientY / this.cellSize);
		
		if (this.grid[y * this.gridWidth + x] === -1) {
			this.grid[y * this.gridWidth + x] = 0;
		}
		else {
			this.grid[y * this.gridWidth + x] = -1;
		}
		this.dirtyCells.push(y * this.gridWidth + x);
		this.isDirty = true;
	}
}

GameOfLife.prototype.toggleGame = function(dispatchEvent) {
	if (dispatchEvent === undefined) {
		dispatchEvent = true;
	}
	if (this.started) {
		clearInterval(this.timerId);
		if (dispatchEvent && this.settings) {
			this.settings.onGamePause();
		}
	}
	else {
		this.bringTheChosenOnesToLife();
		this.nextStep();
		this.timerId = setInterval(function() {this.nextStep()}.bind(this), this.interval);
		if (dispatchEvent && this.settings) {
			this.settings.onGameStart();
		}
	}
	this.started = !this.started;
}

GameOfLife.prototype.bringTheChosenOnesToLife = function() {
	for (var i = 0, len = this.gridHeight * this.gridWidth; i < len; i++) {
		if (this.grid[i] === -1) {
			this.grid[i] = 1;
			this.dirtyCells.push(i);
		}
	}
	this.isDirty = true;
}

GameOfLife.prototype.nextStep = function() {
	for (var i = 0, len = this.gridHeight * this.gridWidth; i < len; ++i) {
		var neighborsCount = this.countNeighbors(i);
		if (this.grid[i] === 1) {
			if (neighborsCount < 2 || neighborsCount > 3) {
				this.newGrid[i] = 2;
				this.isDirty = true;
				this.dirtyCells.push(i);
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

GameOfLife.prototype.startRendering = function() {
	this.rendering = true;
}

GameOfLife.prototype.render = function() {
	if (this.rendering) {
		if (this.isDirty) {
			this.renderFrame();
		}
	}
}

GameOfLife.prototype.renderContext2D = function() {
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

GameOfLife.prototype.renderWebGL = function() {
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

GameOfLife.prototype.computeColor = function(age) {
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
		
		var color = "rgba(" + r + ", " + g + ", " + b + ", " + opacity + ")";
		return [r, g, b, opacity * 255];
	}
}

GameOfLife.prototype.countNeighbors = function(i) {
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