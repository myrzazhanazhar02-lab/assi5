const MAX_PROGRESS = 3;
const COLUMNS = ['todo', 'progress', 'done'];
const COLUMN_NAMES = { todo: 'To do', progress: 'In progress', done: 'Done' };

const tasks = [
  { id: 1, title: 'Confirm oak door order', tag: 'order', priority: 1, urgent: true, column: 'progress' },
  { id: 2, title: 'Measure the hallway', tag: 'install', priority: 2, urgent: false, column: 'todo' },
  { id: 3, title: 'Pay supplier invoice', tag: 'order', priority: 2, urgent: false, column: 'todo' },
  { id: 4, title: 'Deliver steel door', tag: 'delivery', priority: 1, urgent: true, column: 'progress' },
  { id: 5, title: 'Install door in office', tag: 'install', priority: 1, urgent: false, column: 'progress' },
  { id: 6, title: 'Answer customer messages', tag: 'order', priority: 3, urgent: false, column: 'todo' },
  { id: 7, title: 'Check handle stock', tag: 'order', priority: 3, urgent: false, column: 'todo' },
  { id: 8, title: 'Deliver door frame', tag: 'delivery', priority: 2, urgent: false, column: 'done' },
  { id: 9, title: 'Install apartment door', tag: 'install', priority: 3, urgent: false, column: 'done' },
  { id: 10, title: 'Collect prepayment', tag: 'order', priority: 2, urgent: true, column: 'done' },
  { id: 11, title: 'Return damaged door', tag: 'delivery', priority: 3, urgent: false, column: 'todo' }
];

let filterTag = 'all';
let sortByPriority = false;
let boardError = '';

const board = document.getElementById('board');
const sortBtn = document.getElementById('sort-btn');

function countIn(column) {
  let count = 0;
  for (const task of tasks) {
    if (task.column === column) {
      count++;
    }
  }
  return count;
}

function makeButton(text, id, move, label) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = text;
  btn.dataset.id = id;
  btn.dataset.move = move;
  btn.setAttribute('aria-label', label);
  return btn;
}

function makeCard(task) {
  const card = document.createElement('div');
  card.className = 'card';
  card.classList.toggle('urgent', task.urgent);
  const title = document.createElement('strong');
  title.textContent = task.title;
  const info = document.createElement('p');
  info.textContent = 'Tag: ' + task.tag + ' | Priority: ' + task.priority;
  card.append(title, info);
  if (task.column !== 'todo') {
    card.append(makeButton('←', task.id, -1, 'Move back: ' + task.title));
  }
  if (task.column !== 'done') {
    card.append(makeButton('→', task.id, 1, 'Move forward: ' + task.title));
  }
  return card;
}

function render() {
  board.replaceChildren();
  for (const column of COLUMNS) {
    const box = document.createElement('div');
    box.className = 'column';
    const heading = document.createElement('h3');
    heading.textContent = COLUMN_NAMES[column] + ' (' + countIn(column) + ')';
    box.append(heading);
    const list = tasks.filter(t => t.column === column && (filterTag === 'all' || t.tag === filterTag));
    if (sortByPriority) {
      list.sort((a, b) => a.priority - b.priority);
    }
    if (list.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = filterTag === 'all' ? 'No cards here.' : 'No cards with this tag.';
      box.append(empty);
    }
    for (const task of list) {
      box.append(makeCard(task));
    }
    board.append(box);
  }
  const done = countIn('done');
  const percent = Math.round(done / tasks.length * 100);
  document.getElementById('bar').value = percent;
  document.getElementById('bar-text').textContent = done + ' of ' + tasks.length + ' (' + percent + '%)';
  document.getElementById('board-message').textContent = boardError;
  sortBtn.setAttribute('aria-pressed', sortByPriority);
  sortBtn.textContent = sortByPriority ? 'Sorted by priority (click to undo)' : 'Sort by priority';
}

board.addEventListener('click', event => {
  const btn = event.target.closest('button');
  if (!btn) {
    return;
  }
  const task = tasks.find(t => t.id === Number(btn.dataset.id));
  const target = COLUMNS[COLUMNS.indexOf(task.column) + Number(btn.dataset.move)];
  if (target === 'progress' && countIn('progress') >= MAX_PROGRESS) {
    boardError = 'In progress holds at most ' + MAX_PROGRESS + ' cards. Finish one first.';
  } else {
    task.column = target;
    boardError = '';
  }
  render();
});

document.getElementById('tag-filter').addEventListener('change', event => {
  filterTag = event.target.value;
  render();
});

sortBtn.addEventListener('click', () => {
  sortByPriority = !sortByPriority;
  render();
});

render();
