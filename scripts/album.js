var setSong = function (songNumber) {
	if (currentSoundFile) {
		currentSoundFile.stop();
	}
	currentlyPlayingSongNumber = parseInt(songNumber);
	currentSongFromAlbum = currentAlbum.songs[songNumber - 1]; //song number one less than index
	currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
		formats: ['mp3'],
		preload: true
	});
	setVolume(currentVolume);
};

var seek = function(time) {
     if (currentSoundFile) {
         currentSoundFile.setTime(time);
     }
};

var setVolume = function (volume) {
	if (currentSoundFile) {
		currentSoundFile.setVolume(volume);
	}
};

var getSongNumberCell = function (number) {
	return $('.song-item-number[data-song-number="' + number + '"]');
};

//function to dynamically generate song row content
var createSongRow = function (songNumber, songName, songLength) {
	var template =
		'<tr class="album-view-song-item">' + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>' + '  <td class="song-item-title">' + songName + '</td>' + '  <td class="song-item-duration">' + songLength + '</td>' + '</tr>';
	var $row = $(template);

	var clickHandler = function () {

		var songNumber = parseInt($(this).attr('data-song-number'));

		if (currentlyPlayingSongNumber !== null) {
			// Revert to song number for currently playing song because user started playing new song.
			var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);

			currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
			currentlyPlayingCell.html(currentlyPlayingSongNumber);
		}

		if (currentlyPlayingSongNumber !== songNumber) {
			// Switch from Play -> Pause button to indicate new song is playing.
			setSong(songNumber);
			currentSoundFile.play();
			updateSeekBarWhileSongPlays();
			$(this).html(pauseButtonTemplate);
			currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
			
			var $volumeFill = $('.volume .fill');
			var $volumeThumb = $('.volume .thumb');
			$volumeFill.width(currentVolume + '%');
			$volumeThumb.css({left: currentVolume + '%'});
			
			updatePlayerBarSong();
		} else if (currentlyPlayingSongNumber === songNumber) {

			if (currentSoundFile.isPaused()) {
				$(this).html(pauseButtonTemplate);
				$('.main-controls .play-pause').html(playerBarPauseButton);
				currentSoundFile.play();
			} else {
				$(this).html(playButtonTemplate);
				$('.main-controls .play-pause').html(playerBarPlayButton);
				currentSoundFile.pause();
			}
		}

	};
	var onHover = function (event) {
		var songNumberCell = $(this).find('.song-item-number');
		var songNumber = parseInt(songNumberCell.attr('data-song-number'));
		if (songNumber !== currentlyPlayingSongNumber) {
			songNumberCell.html(playButtonTemplate);
		}
	};

	var offHover = function (event) {
		var songNumberCell = $(this).find('.song-item-number');
		var songNumber = parseInt(songNumberCell.attr('data-song-number'));
		if (songNumber !== currentlyPlayingSongNumber) {
			songNumberCell.html(songNumber);
		}
	};

	$row.find('.song-item-number').click(clickHandler);
	$row.hover(onHover, offHover);
	return $row;
};

var setCurrentAlbum = function (album) {
	// populate the requred elements and assign corresp. values
	currentAlbum = album;
	var $albumTitle = $('.album-view-title');
	var $albumArtist = $('.album-view-artist');
	var $albumReleaseInfo = $('.album-view-release-info');
	var $albumImage = $('.album-cover-art');
	var $albumSongList = $('.album-view-song-list');
	// add values into elements for the first node - firstChild
	$albumTitle.text(album.title);
	$albumArtist.text(album.artist);
	$albumReleaseInfo.text(album.year + ' ' + album.label);
	$albumImage.attr('src', album.albumArtUrl);
	// clean the slate
	$albumSongList.empty();

	// for loop for all items in album object & insert innerHTML
	for (var i = 0; i < album.songs.length; i++) {
		var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
		$albumSongList.append($newRow);
	}
};

var updateSeekBarWhileSongPlays = function() {
     if (currentSoundFile) {
         // #10
         currentSoundFile.bind('timeupdate', function(event) {
             // #11
             var seekBarFillRatio = this.getTime() / this.getDuration();
             var $seekBar = $('.seek-control .seek-bar');
 
             updateSeekPercentage($seekBar, seekBarFillRatio);
         });
     }
 };

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    // #1
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
 
    // #2
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
 };

var setupSeekBars = function() {
     var $seekBars = $('.player-bar .seek-bar');
 
      $seekBars.click(function(event) {
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;
        
        if ($(this).parent().attr('class') == 'seek-control') {
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
            setVolume(seekBarFillRatio * 100);   
        }
        
        updateSeekPercentage($(this), seekBarFillRatio);
    });

    $seekBars.find('.thumb').mousedown(function(event) {

        var $seekBar = $(this).parent();

        $(document).bind('mousemove.thumb', function(event){
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;
            
            if ($seekBar.parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());   
            } else {
                setVolume(seekBarFillRatio);
            }
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
		 
		  $(document).bind('mouseup.thumb', function() {
             $(document).unbind('mousemove.thumb');
             $(document).unbind('mouseup.thumb');
         });	 
	 });
};	

var trackIndex = function (album, song) {
	return album.songs.indexOf(song);
};

var nextSong = function () {

	var getLastSongNumber = function (index) {
		return index == 0 ? currentAlbum.songs.length : index;
	};

	var currentSongIndex = trackIndex(currentAlbum, setSong(songNumber));
	// Note that we're _incrementing_ the song here
	currentSongIndex++;

	if (currentSongIndex >= currentAlbum.songs.length) {
		currentSongIndex = 0;
	}

	// Set a new current song
	setSong(songNumber) = currentSongIndex + 1;
	currentSoundFile.play();
	updateSeekBarWhileSongPlays();

	// Update the Player Bar information
	updatePlayerBarSong()
	var lastSongNumber = getLastSongNumber(currentSongIndex);
	var $nextSongNumberCell = getSongNumberCell(setSong(songNumber));
	var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

	$nextSongNumberCell.html(pauseButtonTemplate);
	$lastSongNumberCell.html(lastSongNumber);
};

var togglePlayFromPlayerBar = function() {							
	var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
	if (currentSoundFile.isPaused()) {
		$(currentlyPlayingCell).html(pauseButtonTemplate);
		$('.main-controls .play-pause').html(playerBarPauseButton);
		currentSoundFile.play();
	} else {
		$(currentlyPlayingCell).html(playButtonTemplate);
		$('.main-controls .play-pause').html(playerBarPlayButton);
		currentSoundFile.pause();
	}
}

var previousSong = function () {

	// Note the difference between this implementation and the one in
	// nextSong()
	var getLastSongNumber = function (index) {
		return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
	};

	var currentSongIndex = trackIndex(currentAlbum, setSong(SongNumber));
	// Note that we're _decrementing_ the index here
	currentSongIndex--;

	if (currentSongIndex < 0) {
		currentSongIndex = currentAlbum.songs.length - 1;
	}

	// Set a new current song
	setSong(songNumber) = currentSongIndex + 1;
	currentSoundFile.play();
	updateSeekBarWhileSongPlays();

	// Update the Player Bar information
	updatePlayerBarSong();

	var lastSongNumber = getLastSongNumber(currentSongIndex);
	var $previousSongNumberCell = getSongNumberCell(setSong(getLastSongNumber));
	var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

	$previousSongNumberCell.html(pauseButtonTemplate);
	$lastSongNumberCell.html(lastSongNumber);

};

var updatePlayerBarSong = function () {

	$('.currently-playing .song-name').text(currentSongFromAlbum.title);
	$('.currently-playing .artist-name').text(currentAlbum.artist);
	$('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
	$('.main-controls .play-pause').html(playerBarPauseButton);
};

var mouseOverHandler = function (targetElement) {
	if (event.target.parentElement.className === 'album-view-song-item') {
		event.target.parentElement.querySelector('.song-item-number').innerHTML = playButtonTemplate;
		var songItem = getSongItem(event.target);
		if (songItem.getAttribute('data-song-number') !== currentlyPlayingSong) {
			songItem.innerHTML = playButtonTemplate;
		}
	} //end if 
};

var mouseLeaveHandler = function (targetElement) {
	// store song row that mouse is leaving
	var songItem = getSongItem(event.target);
	var songItemNumber = songItem.getAttribute('data-song-number');
	// do NOT change button from pause if currently playing
	if (songItemNumber === currentlyPlayingSong) {
		songItem.innerHTML = pauseButtonTemplate;
	} else {
		songItem.innerHTML = songItemNumber;
	}
};

// Album button templates
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

// global variables
var currentlyPlayingSong = null;
var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $clickPlayerBar = $('.main-controls .play-pause');

$(document).ready(function () {
	setCurrentAlbum(albumPicasso);
	setupSeekBars();
	$previousButton.click(previousSong);
	$clickPlayerBar.click(togglePlayFromPlayerBar);
	$nextButton.click(nextSong);
}); //end doc ready