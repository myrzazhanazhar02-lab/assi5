const MODELS = [
  { id: 'oak', title: 'Oak door', price: 120000, stock: 5 },
  { id: 'steel', title: 'Steel entrance door', price: 180000, stock: 3 },
  { id: 'white', title: 'White interior door', price: 70000, stock: 8 },
  { id: 'glass', title: 'Glass door', price: 95000, stock: 0 }
];
const PROMOS = [
  { code: 'KALI10', percent: 10 },
  { code: 'DOOR5', percent: 5 }
];
const DELIVERY_FEE = 5000;
const NO_DELIVERY_DAY = 0;
const PHONE_DIGITS = 11;
const MIN_CODE = 1000;
const MAX_CODE = 9999;

const $f = id => document.getElementById(id);
const form = $f('form');
form.noValidate = true;
const fields = ['customer', 'phone', 'model', 'quantity', 'date', 'delivery', 'address', 'promo'].map(id => $f(id));
const touched = new Set();

for (const model of MODELS) {
  const option = document.createElement('option');
  option.value = model.id;
  option.textContent = model.title + ' - ' + model.price + ' ₸';
  $f('model').append(option);
}

function findModel(id) {
  return MODELS.find(m => m.id === id);
}

function findPromo(code) {
  return PROMOS.find(p => p.code === code.trim().toUpperCase());
}

function todayString() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function getError(el) {
  const value = el.value.trim();
  if (el.id === 'address') {
    if ($f('delivery').value === 'delivery' && value === '') {
      return 'Address is required for delivery.';
    }
    return '';
  }
  if (el.id === 'promo') {
    if (value !== '' && !findPromo(value)) {
      return 'Unknown promo code.';
    }
    return '';
  }
  if (el.validity.valueMissing) {
    return 'Please fill in this field.';
  }
  if (el.id === 'customer' && value.length < 3) {
    return 'Name needs at least 3 characters, spaces do not count.';
  }
  if (el.id === 'phone') {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== PHONE_DIGITS || digits[0] !== '7') {
      return 'Phone needs 11 digits and starts with 7, like +7 701 123 45 67.';
    }
  }
  if (el.id === 'model' && findModel(el.value).stock === 0) {
    return 'This model is sold out. Choose another one.';
  }
  if (el.id === 'quantity') {
    const model = findModel($f('model').value);
    if (el.validity.valid && model && Number(el.value) > model.stock) {
      return 'Only ' + model.stock + ' in stock.';
    }
  }
  if (el.id === 'date') {
    if (el.value < todayString()) {
      return 'The date is in the past.';
    }
    if (new Date(el.value + 'T00:00:00').getDay() === NO_DELIVERY_DAY) {
      return 'We do not work on Sundays. Choose another day.';
    }
  }
  if (!el.validity.valid) {
    return el.validationMessage;
  }
  return '';
}

function showError(el, text) {
  $f(el.id + '-error').textContent = text;
  el.setAttribute('aria-invalid', text === '' ? 'false' : 'true');
  el.classList.toggle('invalid', text !== '');
}

function validateField(el) {
  const text = getError(el);
  showError(el, text);
  return text;
}

function readData() {
  return {
    customer: $f('customer').value.trim(),
    phone: $f('phone').value.trim(),
    model: findModel($f('model').value),
    quantity: Number($f('quantity').value) || 0,
    date: $f('date').value,
    delivery: $f('delivery').value,
    address: $f('address').value.trim(),
    promo: findPromo($f('promo').value)
  };
}

function calculate(data) {
  const subtotal = data.model ? data.model.price * data.quantity : 0;
  const percent = data.promo ? data.promo.percent : 0;
  const discount = Math.round(subtotal * percent / 100);
  const fee = data.delivery === 'delivery' ? DELIVERY_FEE : 0;
  return { percent: percent, discount: discount, fee: fee, total: subtotal - discount + fee };
}

function addLine(card, text, className) {
  const line = document.createElement('p');
  line.textContent = text;
  if (className) {
    line.className = className;
  }
  card.append(line);
}

function buildCard(data, code) {
  const sums = calculate(data);
  const card = document.createElement('div');
  card.className = 'order';
  const title = document.createElement('h4');
  title.textContent = code ? 'Order ' + code : 'Your order';
  card.append(title);
  addLine(card, data.customer || 'Name not set');
  addLine(card, data.model ? data.model.title + ' x ' + data.quantity : 'No door chosen');
  addLine(card, 'Date: ' + (data.date || 'not set'));
  if (data.delivery === 'delivery') {
    addLine(card, 'Delivery: ' + (data.address || 'address not set') + ' (+' + sums.fee + ' ₸)');
  } else if (data.delivery === 'pickup') {
    addLine(card, 'Pickup from the shop');
  }
  if (sums.percent > 0) {
    addLine(card, 'Promo ' + data.promo.code + ': -' + sums.discount + ' ₸');
  }
  addLine(card, 'Total: ' + sums.total + ' ₸', 'total');
  return card;
}

function update() {
  $f('preview').replaceChildren(buildCard(readData(), ''));
}

function setSummary(text, type) {
  const box = $f('summary');
  box.textContent = text;
  box.className = 'summary ' + type;
}

form.addEventListener('focusout', event => {
  if (!fields.includes(event.target)) {
    return;
  }
  touched.add(event.target.id);
  validateField(event.target);
});

form.addEventListener('input', () => {
  update();
  for (const el of fields) {
    if (touched.has(el.id)) {
      validateField(el);
    }
  }
});

form.addEventListener('submit', event => {
  event.preventDefault();
  let count = 0;
  let first = null;
  for (const el of fields) {
    touched.add(el.id);
    if (validateField(el) !== '') {
      count++;
      if (first === null) {
        first = el;
      }
    }
  }
  if (count > 0) {
    setSummary('Found ' + count + ' error(s). Fix them and try again.', 'error');
    first.focus();
    return;
  }
  const code = 'KG-' + (Math.floor(Math.random() * (MAX_CODE - MIN_CODE + 1)) + MIN_CODE);
  $f('result').prepend(buildCard(readData(), code));
  form.reset();
  touched.clear();
  for (const el of fields) {
    showError(el, '');
  }
  update();
  setSummary('Order ' + code + ' is placed. Kali Group will call you.', 'success');
  $f('summary').focus();
});

update();
