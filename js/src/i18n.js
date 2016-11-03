function I18n() {
	this.messages = {
		'en': {
			'settings.label.speed': 'Speed',
			'settings.label.trace': 'Trace',
			'settings.label.color': 'Color'
		},
		'fr': {
			'settings.label.speed': 'Vitesse',
			'settings.label.trace': 'Trace',
			'settings.label.color': 'Couleur'
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