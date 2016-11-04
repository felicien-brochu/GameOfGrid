function I18n() {
	this.messages = {
		'en': {
			'settings.label.speed': 'Speed',
			'settings.label.trace': 'Trace',
			'settings.label.color': 'Color',

			'tutorial.button.skip': 'Skip tutorial',
			'tutorial.button.next': 'Next &gt;',
			'tutorial.button.end': 'OK',
			'tutorial.welcome.title': 'Welcome to Game of Grid!',
			'tutorial.welcome.text': 'This game is freely inspired from the Conway\'s game of life<br/><br/>To play draw something on the grid and click on play',
			'tutorial.play': 'Click play or hit the space bar to bring the grid to life',
			'tutorial.history': 'Click undo/redo to cancel your last actions (Ctrl+Z/Ctrl+Y)',
			'tutorial.clear': 'Click the recycle bin to clear the grid',
			'tutorial.menu': 'Click here to toggle the panel',
			'tutorial.sliders': 'Tweak speed, trace and color here',
			'tutorial.symmetry': 'Choose the symmetry to draw with',
			'tutorial.patterns': 'Click on these to draw a preset pattern',
			'tutorial.fullscreen': 'Go into fullscreen',
			'tutorial.tutorial': 'To see this tutorial again click here'
		},
		'fr': {
			'settings.label.speed': 'Vitesse',
			'settings.label.trace': 'Trace',
			'settings.label.color': 'Couleur',

			'tutorial.button.skip': 'Skip tutorial',
			'tutorial.button.next': 'Next &gt;',
			'tutorial.button.end': 'OK',
			'tutorial.welcome.title': 'Welcome to Game of Grid!',
			'tutorial.welcome.text': 'This game is freely inspired from the Conway\'s game of life<br/><br/>To play draw something on the grid and click on play',
			'tutorial.play': 'Click play or hit the space bar to bring the grid to life',
			'tutorial.history': 'Click undo/redo to cancel your last actions (Ctrl+Z/Ctrl+Y)',
			'tutorial.clear': 'Click the recycle bin to clear the grid',
			'tutorial.menu': 'Click here to toggle the panel',
			'tutorial.sliders': 'Tweak speed, trace and color here',
			'tutorial.symmetry': 'Choose the symmetry to draw with',
			'tutorial.patterns': 'Click on these to draw a preset pattern',
			'tutorial.fullscreen': 'Go into fullscreen',
			'tutorial.tutorial': 'To see this tutorial again click here'
		}
	};
	this.language = this.getBestLanguage();
}

I18n.prototype.getBestLanguage = function() {
	var bestLanguage = 'en';
	loop:
	for (var i = 0; i < navigator.languages.length; i++) {
		for (var j = 0; j < Object.keys(this.messages).length; j++) {
			if (navigator.languages[i].includes(Object.keys(this.messages)[j])) {
				bestLanguage = Object.keys(this.messages)[j];
				break loop;
			}
		}
	}
	return bestLanguage;
}

I18n.prototype.translateAll = function() {
	var translatables = document.getElementsByClassName("gog-i18n");
	for (var i = 0; i < translatables.length; i++) {
		this.translate(translatables[i]);
	}
}

I18n.prototype.translate = function(translatable) {
	var key = translatable.innerHTML;
	translatable.innerHTML = this.messages[this.language][key];
}