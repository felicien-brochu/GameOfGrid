function generateRandomPattern(grid, gridWidth, gridHeight) {
	generateLinearDistribution(grid, gridWidth, gridHeight, 0.1);
}

function generateLinearDistribution(grid, gridWidth, gridHeight, aliveRate) {
	for (var i = 0, len = gridHeight * gridWidth; i < len; ++i) {
		grid[i] = Math.random() > aliveRate ? 0 : -1;
	}
}

function generateCrossPattern(grid, gridWidth, gridHeight) {
	var halfWidth = Math.floor(gridWidth / 2),
		halfHeight = Math.floor(gridHeight / 2);

	var a = Math.floor(Math.random() * 6 + 2),
		b = Math.floor(Math.random() * (8 - a) + a);
	var horizontal = Math.random() < 0.5;

	for (var i = 0, len = gridHeight * gridWidth; i < len; ++i) {
		var x = Math.floor(i % gridWidth),
			y = Math.floor(i / gridWidth);
		if (((horizontal && (x % a == halfWidth % b) || !horizontal && (y % a == halfHeight % b)) || (x == halfWidth || y == halfHeight)) && !(x == halfWidth && y == halfHeight)) {
			grid[i] = -1;
		} else {
			grid[i] = 0;
		}
	}
}

function generateRocketLaunchersCanvas(grid, gridWidth, gridHeight) {
	var brush = [[0, -1, -1], [-1, -1, 0], [0, -1, 0]];
	var xWidth = 40, yWidth = 35;
	var xTilt = 10, yTilt = 15;
	generateBrushCanvas(grid, gridWidth, gridHeight, brush, xWidth, yWidth, xTilt, yTilt);
}

function generateBrushCanvas(grid, gridWidth, gridHeight, brush, xWidth, yWidth, xTilt, yTilt) {
	var offset = Math.floor(Math.sqrt(xWidth * xWidth + yWidth * yWidth) / 2);

	for (var i = 0, len = gridHeight * gridWidth; i < len; ++i) {
		var x = Math.floor(i % gridWidth),
			y = Math.floor(i / gridWidth);

		var epsilon = 1e-9;
		var k = Math.floor((y - (yTilt * x) / xWidth) / (yWidth - (yTilt * xTilt / xWidth)) + epsilon),
			l = Math.floor((x - (xTilt * y) / yWidth) / (xWidth - (xTilt * yTilt / yWidth)) + epsilon);

		var closestY = Math.round((l * yTilt - l * xTilt * yTilt * yTilt / (xWidth * yWidth) - k * xTilt * yTilt / xWidth + k * yWidth) / (1 - xTilt * yTilt / (xWidth * yWidth))),
			closestX = Math.round(xTilt * (closestY - l * yTilt) / yWidth + l * xWidth);

		var xOffset = Math.floor(x - closestX),
			yOffset = Math.floor(y - closestY);

		if (yOffset - offset < brush.length && xOffset - offset < brush[0].length && xOffset >= offset && yOffset >= offset) {
			grid[i] = brush[yOffset - offset][xOffset - offset];
		} else {
			grid[i] = 0;
		}
	}
}

function generateGunPattern(grid, gridWidth, gridHeight) {
	var gun = [
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, 0, 0, 0, 0, 0, 0, -1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, -1, 0, 0, 0, 0, -1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1],
		[-1, -1, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, -1, 0, 0, 0, -1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[-1, -1, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, -1, 0, -1, -1, 0, 0, 0, 0, -1, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	];
	var w = gridWidth, h = gridHeight;
	if (gridWidth < gridHeight) {
		w = gridHeight;
		h = gridWidth;
	}
	var startY1 = Math.floor(h / 6 - gun.length / 2),
		startX1 = Math.floor(w / 2 - (h / 3) - 2 * gun.length),
		startY2 = Math.floor(5 * h / 6 - gun.length / 2),
		startX2 = Math.floor(w / 2 + (h / 3) - gun.length - 8);

	for (var i = 0, len = gridHeight * gridWidth; i < len; ++i) {
		var x = Math.floor(i % gridWidth),
			y = Math.floor(i / gridWidth);

		if (gridWidth < gridHeight) {
			x += y;
			y = x - y;
			x -= y;
		}
		var brushX1 = x - startX1,
			brushY1 = y - startY1,
			brushX2 = x - startX2,
			brushY2 = y - startY2;

		if (brushY1  < gun.length && brushY1 >= 0 && brushX1 < gun[0].length && brushX1 >= 0) {
			grid[i] = gun[brushY1][brushX1];
		} else if (brushY2  < gun.length && brushY2 >= 0 && brushX2 < gun[0].length && brushX2 >= 0) {
			grid[i] = gun[gun.length - brushY2 - 1][gun[0].length - brushX2 - 1];
		} else {
			grid[i] = 0;
		}
	}
}