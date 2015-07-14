// main.js

var firstLeft = 0;
var firstBottom  = 0;
var pos = 0;
var pos_val = [];
var SPAWN_INTERVAL = 500;
var MAX_JUNK_INDEX = 5;
var should_spawn = 0;
var score = 0;
var SCORE_PASSED_POKEMON = 1000;
var SCORE_EXTRA_POINTS = 10000;
var game;

var JunkTypes = [
  'pikachu',
  'pikachu',
  'pikachu',
  'pikachu',
  'pikachu',
  'pikachu',
  'pikachu',
  'pikachu',
  'pikachu',
  'pikachu',
  'pikachu',
  'pikachu',
  'multiPoints',
  'extraPoints',
  'extraLife',
];
var JunkTypesBlob = {
  pikachu: {
    onHit: function($el) {
        $el.addClass('blownUp');
        score = 0;
      },
    onMiss: function($el) {
        score += SCORE_PASSED_POKEMON;
      },
  },
  multiPoints: {
    onHit: function($el) {
      $el.addClass('earned');
    },
    onMiss: function($el) {},
  },
  extraPoints: {
    onHit: function($el) {
      $el.addClass('earned');
      score += SCORE_EXTRA_POINTS;
    },
    onMiss: function($el) {},
  },
  extraLife: {
    onHit: function($el) {
      $el.addClass('earned');
      if (life < 3) { life++ }
    },
    onMiss: function($el) {},
  },
};

$(function() {
  console.log('Get ready!');
  initCar();
  updateScore();
  startUpGame()
})

$(function(){
  $(document).bind('keydown', 'space', openMenu);
  $(document).bind('keydown', 'esc', dismissMenu);

  $('#menuBtn').click(openMenu);
  $('#blackout').click(dismissMenu);
})

function initCar() {
  //-- POSITION --
  resetPosVals();
  pos = 0;
  firstLeft = pos_val[0];
  firstBottom = 10;
  $('#mainCar').css({
    'width': move_size(),
    'left': firstLeft,
    'bottom' : firstBottom
  });

  //-- KEYBINDING --
  $(document).bind('keydown', 'a', moveLeft);
  $(document).bind('keydown', 'd', moveRight);
  $(document).bind('keydown', 'c', nextCar);
}

function move_size() {
  return document.width / 5;
}
function resetPosVals() {
  pos_val = [
    0,
    1*move_size(),
    2*move_size(),
    3*move_size(),
    4*move_size()
  ];
}
function nextPos() {
  if (pos < 4) {
    resetPosVals();
    pos++;
  }
  return pos_val[pos];
}
function prevPos() {
  if (pos > 0) {
    resetPosVals();
    pos--;
  }
  return pos_val[pos];
}

function move(newLeft) {
  $('#mainCar').css({'left': newLeft})
               .attr({'data-lane': pos});
  checkForCollision();
}
function moveLeft() { move(prevPos()) }
function moveRight() { move(nextPos()) }

function nextCar() {
  var $car = $('#mainCar .car');
  var type = $car.attr('data-car-color');
  var nextType = 'red';

  if (type === 'red') {
    nextType = 'blue';
  } else if (type === 'blue') {
    nextType = 'yellow';
  }

  $car.attr('data-car-color', nextType);
  console.log($car.data('car-color'))
}

////////////////////
// RANDOM JUNK SPAWN
////////////////////

function spawnJunk() {
  should_spawn = (should_spawn + 1) % 2;
  if (should_spawn) {
    var junk = randomJunkElement();
    $('body').append(junk);
  }
}

function randomJunkLane() {
  return Math.floor((Math.random() * 5) + 0);
}
function randomJunkTypeNumber() {
  return Math.floor((Math.random() * JunkTypes.length) + 0);
}
function randomJunkType() {
  return JunkTypes[randomJunkTypeNumber()];
}
function junkTopValue(index) {
  var junk_move_size = document.height/MAX_JUNK_INDEX;
  var top_vals = [0];
  for (var i = 1; i < MAX_JUNK_INDEX; i++) {
    top_vals.push(top_vals[i-1] + junk_move_size);
  }
  return top_vals[index];
}
function randomJunkElement() {
  var lane = randomJunkLane();
  var junkType = randomJunkType();
  var firstIndex = 0;
  var junk = $('<div>').addClass(junkType);
  return $('<div>').append(junk)
                   .addClass('lane_wrap junk')
                   .css({
                    'top': junkTopValue(firstIndex),
                    'width': move_size(),
                    'left': pos_val[lane]
                   })
                   .attr({
                    'data-index': firstIndex,
                    'data-lane': lane,
                    'data-type': junkType,
                   });
}
function moveJunkDown() {
  $('.blownUp').remove();
  $('.junk').each(function() {
    var $junk = $(this);
    var newIndex = parseInt($junk.attr('data-index')) + 1;
    if (newIndex < MAX_JUNK_INDEX) {
      $junk.css( {'top': junkTopValue(newIndex)})
           .attr({'data-index': newIndex});
    }
    else {
      var thisJunkTypeData = getJunkTypeData($junk);
      thisJunkTypeData.onMiss($junk);
      $junk.remove();
    }
    checkForCollision();
  });
}

function checkForCollision() {
  var carLane = $('#mainCar').attr('data-lane');
  $('.junk').each(function() {
    var $junk = $(this);
    var thisJunkTypeData = getJunkTypeData($junk);
    var index = parseInt($junk.attr('data-index')) + 1;
    if (index === MAX_JUNK_INDEX) {
      var thisLane = $junk.attr('data-lane');
      if (thisLane === carLane) {
        thisJunkTypeData.onHit($junk);
      }
    }
  });
}

function getJunkTypeData($junk) {
  var thisJunkType = $junk.attr('data-type');
  return JunkTypesBlob[thisJunkType];
}

function updateScore() {
  $('#score').text(score);
}

function openMenu() {
  pauseGame();
  $('#menuScreen').fadeIn();
}
function dismissMenu() {
  startUpGame();
  $('#menuScreen').fadeOut();
}

function startUpGame() {
  clearInterval(game);
  game = setInterval(function(){
    moveJunkDown();
    spawnJunk();
    updateScore();
  }, SPAWN_INTERVAL);
}

function pauseGame() {
  clearInterval(game);
}
