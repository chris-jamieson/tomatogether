function playAudioSample ( fileName ) {
	if ( !buzz.isSupported ) {
		console.log('can\'t play sounds because buzz.js not supported');
	}else{
		var s = new buzz.sound('/sounds/' + fileName, {
			formats: [ 'wav' ] // @TODO add other file types to support other browsers: ['ogg', 'mp3', 'aac', 'wav']
		});
		s.play();
	}
};

Template.soundEffectOption.events ( {
	'click .play-audio': function ( event ) {
		event.preventDefault();
		playAudioSample( this.option.value );
	}
} );