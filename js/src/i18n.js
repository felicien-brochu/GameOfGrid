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
			'tutorial.welcome.text': 'Draw something on the grid and click play. Each drawing will give birth to a unique animation.<br/><br/>This game is freely inspired from <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life">Conway\'s game of life</a>.',
			'tutorial.play': 'Click play to bring the grid to life<br/><br/>hotkey: <kbd>Space bar</kbd>',
			'tutorial.history': 'Click Undo/Redo to cancel your last actions<br/><br/>hotkey: <kbd>Ctrl</kbd>+<kbd>Z</kbd>/<kbd>Ctrl</kbd>+<kbd>Y</kbd>',
			'tutorial.clear': 'Click the recycle bin to clear the grid',
			'tutorial.menu': 'Click here to toggle the panel',
			'tutorial.sliders': 'Tweak speed, trace length and color here',
			'tutorial.symmetry': 'Choose the symmetry to draw with',
			'tutorial.patterns': 'Click on these to draw a preset pattern',
			'tutorial.fullscreen': 'Fullscreen',
			'tutorial.tutorial': 'To see this tutorial again, click here',

			'about.title': 'About Game of Grid',
			'about.concept': 'Game of Grid is a graphics game freely inspired from <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life">Conway\'s game of life</a>. Each drawing you draw gives birth to a unique animation.',
			'about.presentation': 'Game of Grid is an open source project created by Félicien Brochu. Please visit the <a href="https://github.com/felicien-brochu/GameOfGrid">GitHub repository</a>: any contribution is welcome.',
			'about.donate': '<a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=contact%40gameofgrid%2ecom&lc=FR&item_name=gameofgrid%2ecom&no_note=1&no_shipping=1&rm=1&return=http%3a%2f%2fgameofgrid%2ecom&cancel_return=http%3a%2f%2fgameofgrid%2ecom&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHosted">Donate</a> to support this project.<br/>contact: <a href="mailto:contact@gameofgrid.com">contact@gameofgrid.com</a>',
			'about.button': 'OK'
		},
		'fr': {
			'settings.label.speed': 'Vitesse',
			'settings.label.trace': 'Trace',
			'settings.label.color': 'Couleur',

			'tutorial.button.skip': 'Passer',
			'tutorial.button.next': 'Suivant &gt;',
			'tutorial.button.end': 'OK',
			'tutorial.welcome.title': 'Bienvenue dans Game of Grid&nbsp;!',
			'tutorial.welcome.text': 'Dessine quelque chose sur la grille puis clique sur lecture. Chaque dessin donnera naissance à une animation unique.<br/><br/>Ce jeu est librement inspiré du <a href="https://fr.wikipedia.org/wiki/Jeu_de_la_vie">jeu de la vie</a>.',
			'tutorial.play': 'Clique sur lecture pour donner vie à la grille<br/><br/>raccourci&nbsp;: <kbd>Barre d\'espace</kbd>',
			'tutorial.history': 'Clique Annuler/Rétablir pour annuler tes dernières actions<br/><br/>raccourcis&nbsp;: <kbd>Ctrl</kbd>+<kbd>Z</kbd>/<kbd>Ctrl</kbd>+<kbd>Y</kbd>',
			'tutorial.clear': 'Clique sur la corbeille pour effacer la grille',
			'tutorial.menu': 'Clique ici pour afficher le panneau latéral',
			'tutorial.sliders': 'Ajuste la vitesse, la longueur de la trace et la couleur ici',
			'tutorial.symmetry': 'Choisis la symétrie du dessin',
			'tutorial.patterns': 'Clique sur l\'un de ces boutons pour dessiner un motif prédéfini',
			'tutorial.fullscreen': 'Plein écran',
			'tutorial.tutorial': 'Pour revoir ce tutoriel, clique ici',

			'about.title': 'À propos de Game of Grid',
			'about.concept': 'Game of Grid  est un jeu graphique librement inspiré du <a href="https://fr.wikipedia.org/wiki/Jeu_de_la_vie">jeu de la vie</a>. Chaque dessin donne naissance à une animation unique.',
			'about.presentation': 'Game of Grid est un projet open source créé par Félicien Brochu. N\'hésite pas à visiter le <a href="https://github.com/felicien-brochu/GameOfGrid">dépôt GitHub</a>&nbsp;: toute contribution est la bienvenue.',
			'about.donate': '<a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=contact%40gameofgrid%2ecom&lc=FR&item_name=gameofgrid%2ecom&no_note=1&no_shipping=1&rm=1&return=http%3a%2f%2fgameofgrid%2ecom&cancel_return=http%3a%2f%2fgameofgrid%2ecom&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHosted">Faire un don</a> pour soutenir ce projet.<br/>contact&nbsp;: <a href="mailto:contact@gameofgrid.com">contact@gameofgrid.com</a>',
			'about.button': 'OK'
		}
	};
	this.language = this.getBestLanguage();
}

if (!String.prototype.includes) {
	String.prototype.includes = function() {
		'use strict';
		return String.prototype.indexOf.apply(this, arguments) !== -1;
	};
}

I18n.prototype.getBestLanguage = function() {
	var bestLanguage = 'en';
	var languages = navigator.languages;
	if (!languages) {
		languages = [navigator.language];
	}
	loop:
	for (var i = 0; i < languages.length; i++) {
		for (var j = 0; j < Object.keys(this.messages).length; j++) {
			if (languages[i].includes(Object.keys(this.messages)[j])) {
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