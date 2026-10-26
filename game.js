const MAX_LIVES = 3;
const MIN_PRICE = 50;
const MAX_PRICE = 300;

let current;
let lives;
let streak;
let over;
let best = 0;

const byId = id => document.getElementById(id);

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function say(text, type) {
  const msg = byId('message');
  msg.textContent = text;
  msg.className = type;
}

function draw() {
  byId('current').textContent = current;
  byId('lives').textContent = lives;
  byId('streak').textContent = streak;
  byId('best').textContent = best;
  byId('game').classList.toggle('over', over);
}

function start() {
  current = randInt(MIN_PRICE, MAX_PRICE);
  lives = MAX_LIVES;
  streak = 0;
  over = false;
  draw();
  say('Make your guess.', '');
}

function guess(choice) {
  if (over) {
    say('The game is over. Press Restart.', 'error');
    return;
  }
  if (choice !== 'higher' && choice !== 'lower') {
    say('Unknown move.', 'error');
    return;
  }
  const next = randInt(MIN_PRICE, MAX_PRICE);
  const right = (choice === 'higher' && next >= current) || (choice === 'lower' && next <= current);
  if (right) {
    streak++;
    if (streak > best) {
      best = streak;
    }
    say('Right! The next price was ' + next + '.', 'win');
  } else {
    lives--;
    streak = 0;
    if (lives === 0) {
      over = true;
      say('Wrong, the price was ' + next + '. No lives left: game over.', 'lose');
    } else {
      say('Wrong, the price was ' + next + '. You lose a life.', 'lose');
    }
  }
  current = next;
  draw();
}

for (const btn of document.querySelectorAll('[data-choice]')) {
  btn.addEventListener('click', () => guess(btn.dataset.choice));
}
byId('restart').addEventListener('click', start);
start();
