var isHolding = {
  a: false,
  d: false,
  ' ': false
};

var multiplier = {
  perfect: 1,
  miss: 0,
  combo5: 1.05,
  combo10: 1.10
};

var isPlaying = false;
var combo = 0;
var score = 0;
var animation = 'moveDown';
var trackContainer;
var tracks;
var comboText;
var inc = 1;
var index;
var notes = [];
var noteInc = 0;
var pageMax;
var tempo;

const sb = document.querySelector('#music');
const control = document.querySelector('#control');
const startButton = document.querySelector('.btn--start');
const audio = document.querySelector('.song');
const flash = document.querySelector('.flash');
const menu = document.querySelector('.menu');
const game = document.querySelector('.game');
const allScore = document.querySelector('.score');
const hit = document.querySelector('.hit');
const display = document.querySelector('.timer');
const score__count = document.querySelector('.score__count');
const result = document.querySelector('.result');
const score__disp = document.querySelector('.score');
  
  
var initializeNotes = function (choice) {
  var noteElement;
  var trackElement;
  while (trackContainer.hasChildNodes()) {
    trackContainer.removeChild(trackContainer.lastChild);
  }
  var mySong = song.sheet[choice];
  trackElement = document.createElement('div');
  trackElement.classList.add('track');

  mySong.notes.forEach(function (note) {
    noteElement = document.createElement('div');
    noteElement.classList.add('note');
    noteElement.style.animationName = animation;
    noteElement.style.animationTimingFunction = 'linear';
    noteElement.style.animationDuration = 3 + 's';
    noteElement.style.animationDelay = note.TIME + 's';
    noteElement.style.animationPlayState = 'paused';
	noteElement.style.visibility = 'hidden';
    trackElement.appendChild(noteElement);
	notes.push(note.TIME);
  });

  trackContainer.appendChild(trackElement);
  tracks = document.querySelector('.track');
  
  tempo = Math.round(notes[1]*1000);
};

var displayFlash = function() {
  
  flash.style.animationName = 'flash';
  flash.style.animationTimingFunction = 'linear';
  flash.style.animationDuration = tempo + 'ms';
  flash.style.animationDelay = (3000 - (2*tempo)) + 'ms';
  flash.style.animationIterationCount = 2;
  flash.style.visibility = 'visible';
}

var updateAnimation = function () {
  animation = 'moveDownFade';
  initializeNotes();
};

var setupStartButton = function () {
  startButton.addEventListener('click', function () {
    index = parseInt(sb.selectedIndex);
	contChoice = parseInt(control.selectedIndex);
	initializeNotes(index);
	setupControl(contChoice);
	var musicUrl = 'media/' + song.URL[index] + '.mp3';
	isPlaying = true;

    audio.setAttribute('src', musicUrl);
	audio.load();
	setupBg(inc);
	pageMax = song.pages[index];
	
	menu.style.opacity = 0;
	menu.style.flex = '0 20%';
	game.style.flex = '0 80%';
	startButton.style.visibility = 'hidden';
    displayFlash();
	
    setTimeout(function () {
		audio.play();
		startTimer(audio.duration);
    }, 3000);
	
	document.querySelectorAll('.note').forEach(function (note) {
      note.style.animationPlayState = 'running';
    });
	
	hit.style.visibility = 'visible';
  });
};

var startTimer = function (duration) {
  let timer = duration;
  let minutes;
  let seconds;
  
  display.style.display = 'block';
  display.style.opacity = 1;
  
  allScore.style.display = 'block';
  allScore.style.opacity = 1;
  score__disp.innerHTML = 'Score: ' + score;

  var songDurationInterval = setInterval(function () {
    
	const minutes = Math.floor(timer / 60);
    const seconds = Math.floor(timer - minutes * 60);
	
	const minuteValue = minutes.toString().padStart(2, '0');
	const secondValue = seconds.toString().padStart(2, '0');
	
	display.innerHTML = `${minuteValue}:${secondValue}`;

    if (--timer < 0) {
      setTimeout(function () {
		clearInterval(songDurationInterval);
		showResult();
      }, 3000);
    }
  }, 1000);
  
};

var showResult = function () {
  score__count.innerHTML = 'Your result is: ' + score + ' points!';
  display.style.opacity = 0;
  result.style.opacity = 1;
  menu.style.flex = '0 100%';
  game.style.flex = '0 0%';
	
};

var setupNoteMiss = function () {
  trackContainer.addEventListener('animationend', function (event) {
	removeNoteFromTrack(event.target.parentNode, event.target);
    updateCombo('miss');
	updateNext();
  });
};

/**
 * Allows keys to be only pressed one time. Prevents keydown event
 * from being handled multiple times while held down.
 */
var setupControl = function(c_Choice) {
  
  if (c_Choice == 1) {
	let _mouse = []
	console.log("MOUSE");

	document.addEventListener('mousemove', function (event) {
	  directionX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
	  directionY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
	  
	  _mouse.push(directionY);
	  let neg = _mouse.slice(-5,-1).every(function (e) {
		return e > 0;
	  });
	  
	  if (_mouse.length >= 6) {
		if ((directionY <= 0) && neg) {
		  if (isPlaying && tracks.firstChild) {
			judge();
		  }
		}
	  }
	});
  }
	
  document.addEventListener('keydown', function (event) {
    var keyIndex = getKeyIndex(event.key);

    if (isPlaying && keyIndex == 1) {
	  if (inc <= 1) {
		return;
	  }
	  else {
		setupBg(inc-1);
		inc -= 1;
	  }
	}
	
	if (isPlaying && keyIndex == 2) {
	  if (inc >= pageMax) {
		return;
	  }
	  else {
		setupBg(inc+1);
		inc += 1;
	  }
	}
	
	if (c_Choice == 0) {
	  if (Object.keys(isHolding).indexOf(event.key) !== -1 && !isHolding[event.key]) {
		isHolding[event.key] = true;
	    if (keyIndex == 0) {
			if (isPlaying && tracks.firstChild) {
			  console.log("Soll: " + notes[noteInc] + " Ist: " + audio.currentTime);
			  judge();
		    }
		}
	  }
	}
  });

  document.addEventListener('keyup', function (event) {
    if (Object.keys(isHolding).indexOf(event.key) !== -1) {
      var keyIndex = getKeyIndex(event.key);
      isHolding[event.key] = false;
    }
  });
};

var setupBg = function (number) {
  var imgUrl = 'img/' + song.URL[index] + number + '.png';
  game.style.backgroundImage = "url('" + imgUrl + "')";
};

var getKeyIndex = function (key) {
  if (key === ' ') {
    return 0;
  } else if (key === 'a') {
	return 1;
  } else if (key === 'd') {
	return 2;
  }
};

var judge = function () {
  var perfectTime = notes[noteInc];
  var mediaTime = audio.currentTime;
  var accuracy = Math.abs(mediaTime - perfectTime);
  var hitJudgement;

  /**
   * As long as the note has travelled less than 3/4 of the height of
   * the track, any key press on this track will be ignored.
   */ 
  if (accuracy > (3 / 4)) {
    displayTiming('early');
	return;
  }

  hitJudgement = getHitJudgement(accuracy);
  updateCombo(hitJudgement);
  calculateScore(hitJudgement);
  score__disp.innerHTML = 'Score: ' + score;
  removeNoteFromTrack(tracks, tracks.firstChild);
  updateNext();
};

var getHitJudgement = function (accuracy) {
  if (accuracy > 0.15 && accuracy < 0.4) {
	return 'perfect';
  } else if (accuracy < 0.15) {
    displayTiming('late');
	return 'miss';
  } else {
	displayTiming('early');
	return 'miss';
  }
};

var displayTiming = function (timing) {
  var accuracyText = document.createElement('div');
  document.querySelector('.hit__accuracy').remove();
  accuracyText.classList.add('hit__accuracy');
  accuracyText.classList.add('hit__accuracy--' + timing);
  accuracyText.innerHTML = timing;
  hit.appendChild(accuracyText);
};

var updateCombo = function (judgement) {
  if (judgement === 'miss') {
    combo = 0;
  } else {
    comboText.innerHTML = ++combo;
  }
};

var calculateScore = function (judgement) {
  if (combo >= 10) {
    score += 1000 * multiplier[judgement] * multiplier.combo10;
  } else if (combo >= 5) {
    score += 1000 * multiplier[judgement] * multiplier.combo5;
  } else {
    score += 1000 * multiplier[judgement];
  }
};

var removeNoteFromTrack = function (parent, child) {
  parent.removeChild(child);
};

var updateNext = function () {
  noteInc += 1;
};

window.onload = function () {
  trackContainer = document.querySelector('.track-container');
  comboText = document.querySelector('.combo');

  setupStartButton();
  //setupKeys();
  setupNoteMiss();
}