function launchFullscreen() {
	if(document.documentElement.requestFullscreen) {
		document.documentElement.requestFullscreen();
	} else if(document.documentElement.mozRequestFullScreen) {
		document.documentElement.mozRequestFullScreen();
	} else if(document.documentElement.webkitRequestFullscreen) {
		document.documentElement.webkitRequestFullscreen();
	} else if(document.documentElement.msRequestFullscreen) {
		document.documentElement.msRequestFullscreen();
	}
}

function exitFullscreen() {
	if(document.exitFullscreen) {
		document.exitFullscreen();
	} else if(document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if(document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	}
}

function isFullscreenSupported() {
	return document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;
}

function getFullscreenElement() {
	return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
}

function toggleFullscreen() {
	if (isFullscreenSupported()) {
		if (getFullscreenElement()) {
			exitFullscreen();
		} else {
			launchFullscreen();
		}
	}
}