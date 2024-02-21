"use strict";

const $jeopardyBoard = $("#JeopardyBoard");
const $startButton = $("#StartButton");
const $loadingSpinner = $("#LoadingSpinner");

// Value of game will become the Game instance populated below
let game;


/** Fill the HTML table #jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <th> for each category
 * - The <tbody> should be filled w/ game.numCluesPerCat <tr>s,
 *   each with a question for each category in a <td>
 *   (initially, just show a "?" where the question/answer would go.)
 *
 */
function fillTable() {

  let $headerRow = $('#header-row');
  for (let category of game.categories) {
    let $th = $('<th>').text(category.title);
    $headerRow.append($th);
  }

  let $bodyContent = $('#body-content');
  for (let i = 0; i < game.numCluesPerCat; i++) {
    let $tr = $('<tr>');

    for (let j = 0; j < game.numCategories; j++) {
      let $td = $('<td>').text('?');
      $tr.append($td);
    }

    $bodyContent.append($tr);
  }
}


/** Handle clicking on a clue: show the question or answer, update clue status.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question
 * - if currently "question", show answer
 * - if currently "answer", ignore click
 * - if clue is being clicked for the first time--> change text color green
 * - plays a chime-sound when the answer is clicked
 * - if clue answer is clicked --> change text color 'purple'
 *
 * - updates status of clue whenever it is clicked, so we know whether it
 * is on an an 'answer', 'question' or null.
 * */

function handleClueClick(evt) {

  let $clickedQuestion = $(evt.target).closest('td, th');

  let row = $clickedQuestion.parent().index();
  let column = $clickedQuestion.index();

  let category = game.categories[column];
  let clue = category.clues[row];

  clue.updateShowingStatus();
  $clickedQuestion.text(clue[clue.showing]);

  if ($clickedQuestion.val(clue[clue.showing] === null)) {
    $clickedQuestion.toggleClass('green');
  }

  if (clue.showing === 'answer') {
    triviaClueSound();
    $(evt.target).closest('td').css('color', 'rgb(73, 73, 169)');
  }
}

/** Once the start button changes to 'Reset', this button will restart
 * the game--> emptying the board and repopulating.
 * --> Changes the color, header title, adds a sound for reboot.
 * --> Header title flashes rapidly on reboot.
 * --> Reloads the page in approx. 2 seconds.
 */
function restart() {
  if ($startButton.text() === 'Reset') {
    setTimeout(() => {
      location.reload();
    }, 2000);

    $('h1')
      .css('color', 'rgb(73, 73, 169)')
      .text('BYE')
      .css('font-size', '100px')
      .css('transition', 'font-size .6s ease');

    $jeopardyBoard.empty();
    rebootSound();
    $('h1').css('animation', 'flash 2ms infinite');
  }
}

/** Event listener for start button, after the 1st time it is clicked */
$startButton.on('click', restart);


/**
 * Shows loading spinner,
 * updates Start button text to "Loading...",
 * hides footer.
 */
function showLoadingState() {

  $startButton.text('Loading...');
  $loadingSpinner.show();
  $('.jazz-footer').hide();
}

/**
 * Shows game board, updates start button text and hides loading spinner.
 */
function hideLoadingState() {
  $startButton.text('Reset');
  $loadingSpinner.hide();
  $('h1').css('animation', 'flash 3s infinite');
  $('.jazz-footer').show();

}


/** Background ambient sound plays on start, for duration of game.
 * (JQuery selector did not work for below function)
*/
function playHiddenSong() {
  const backgroundSound = document.getElementById('backgroundSound');
  if (backgroundSound) {
    backgroundSound.play();
  }
}

/** When the answer is clicked, a synthesizer sound is played. */

function triviaClueSound() {
  const triviaSound = document.getElementById('triviaClueSound');
  if (triviaSound) {
    triviaSound.play();
  }
}

/** When rebooting/restarting the game, a percussion sound is played. */

function rebootSound() {
  const rebootSnd = document.getElementById('rebootSound');
  if (rebootSnd) {
    rebootSnd.play();
  }
}


// DO NOT CHANGE ANY CODE BELOW THIS LINE

/**
 * Generates new game instance and populates game board in DOM.
 */
async function handleStartClick() {
  showLoadingState();

  game = new Game();
  await game.populateCategoryData();

  fillTable();
  hideLoadingState();
  playHiddenSong();
}

$startButton.on("click", handleStartClick);
$jeopardyBoard.on("click", "td", handleClueClick);




