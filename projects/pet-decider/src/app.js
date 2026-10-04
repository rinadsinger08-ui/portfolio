import { recommend, PROFILE_KEYS } from './engine.js';
import { readHistory, addHistory, writeHistory, clearHistory } from './history.js';

const $ = id => document.getElementById(id);
const form = $('lifestyle');
// Accessing the storage property itself can throw in restricted browsers.
let storage;
try { storage = window.localStorage; } catch { storage = null; }
const loaded = readHistory(storage);
let history = loaded.entries;
let result = null;
const selected = new Set();
$('storage-status').textContent = loaded.warning;

function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function clearErrors() {
  $('form-errors').hidden = true;
  $('form-errors').replaceChildren();
  for (const key of PROFILE_KEYS) {
    $(key).removeAttribute('aria-invalid');
    $(`${key}-error`).hidden = true;
    $(`${key}-error`).textContent = '';
  }
}

function showErrors(errors) {
  const summary = $('form-errors');
  summary.append(node('p', 'Please check your answers:'));
  const list = node('ul');
  for (const [key, message] of Object.entries(errors)) {
    const item = node('li');
    const link = node('a', message);
    link.href = `#${key}`;
    link.addEventListener('click', event => { event.preventDefault(); $(key)?.focus(); });
    item.append(link); list.append(item);
    if ($(key)) {
      $(key).setAttribute('aria-invalid', 'true');
      $(`${key}-error`).textContent = message;
      $(`${key}-error`).hidden = false;
    }
  }
  summary.append(list); summary.hidden = false; summary.focus();
}

function resetResults() {
  result = null; selected.clear();
  $('comparison').hidden = true;
  $('comparison-table').replaceChildren();
  $('results-title').textContent = 'Your shortlist starts here.';
  $('results-summary').textContent = 'Answer the questions to explore up to four options.';
  const empty = node('div', undefined, 'empty-state');
  const icon = node('span', '✳'); icon.setAttribute('aria-hidden', 'true');
  empty.append(icon, node('h3', 'Good matches take thought.'), node('p', 'We consider your resources first, then rank the remaining options by activity and experience.'), node('p', 'Sometimes the right result is to wait.'));
  $('results').replaceChildren(empty);
}

function renderResults(next) {
  result = next; selected.clear();
  const container = $('results'); container.replaceChildren();
  $('comparison').hidden = true; $('comparison-table').replaceChildren();
  $('results-title').textContent = next.matches.length ? 'A few paths to explore.' : 'Give it a little more time.';
  $('results-summary').textContent = next.matches.length ? `${next.matches.length} option${next.matches.length === 1 ? '' : 's'} meet your inputs in this model. Select two or more to compare.` : 'No options meet all your inputs in this model. Review the reasons below before changing your plans.';
  if (!next.matches.length) {
    const empty = node('div', undefined, 'empty-state no-match');
    empty.append(node('h3', 'No suitable match right now'), node('p', 'Consider waiting, researching further, or volunteering with animals while you plan. The app will not suggest an animal that fails one of your constraints.'));
    container.append(empty);
  }
  next.matches.forEach(({ pet, reasons }, index) => {
    const card = node('article', undefined, 'pet-card');
    const top = node('div', undefined, 'pet-card-top');
    const icon = node('span', undefined, 'pet-icon'); icon.setAttribute('aria-hidden', 'true');
    const illustration = node('img'); illustration.src = pet.icon; illustration.alt = ''; icon.append(illustration);
    const title = node('div'); title.append(node('p', `OPTION ${String(index + 1).padStart(2, '0')}`, 'eyebrow'), node('h3', pet.name));
    top.append(icon, title); card.append(top, node('p', pet.summary));
    const metrics = node('div', undefined, 'metrics');
    metrics.append(node('span', `${pet.minutes} min/day`), node('span', `$${pet.monthly}/month`), node('span', `$${pet.setup} setup`));
    card.append(metrics, node('small', 'Illustrative planning assumptions · CAD', 'assumption-label'));
    const list = node('ul', undefined, 'reasons');
    for (const reason of reasons) list.append(node('li', reason));
    card.append(list);
    const details = node('details'); details.append(node('summary', 'What to research next'), node('p', pet.care));
    const source = node('a', 'Read the RSPCA care guide ↗'); source.href = pet.source;
    details.append(source); card.append(details);
    const label = node('label', undefined, 'compare-choice');
    const checkbox = node('input'); checkbox.type = 'checkbox'; checkbox.value = pet.id;
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) selected.add(pet.id); else selected.delete(pet.id);
      renderComparison();
    });
    label.append(checkbox, document.createTextNode(`Compare ${pet.name.toLowerCase()}`)); card.append(label);
    container.append(card);
  });
  if (next.excluded.length) {
    const details = node('details', undefined, 'excluded');
    details.append(node('summary', `Why ${next.excluded.length} other option${next.excluded.length === 1 ? ' was' : 's were'} excluded`));
    for (const { pet, blockers } of next.excluded) {
      details.append(node('h3', pet.name));
      const list = node('ul'); for (const blocker of blockers) list.append(node('li', blocker)); details.append(list);
    }
    container.append(details);
  }
  $('announcement').textContent = next.matches.length ? `${next.matches.length} matches found. Results updated.` : 'No suitable matches. Results updated.';
  $('results-title').focus();
}

function renderComparison() {
  const pets = result.matches.filter(match => selected.has(match.pet.id)).map(match => match.pet);
  $('comparison').hidden = pets.length < 2;
  if (pets.length < 2) { $('comparison-table').replaceChildren(); return; }
  const table = node('table'); const caption = node('caption', 'Selected pets: model requirements and care considerations'); table.append(caption);
  const head = node('thead'); const header = node('tr');
  const category = node('th', 'Consideration'); category.scope = 'col'; header.append(category);
  for (const pet of pets) { const cell = node('th', pet.name); cell.scope = 'col'; header.append(cell); }
  head.append(header); table.append(head);
  const body = node('tbody');
  for (const [label, read] of [
    ['Daily care assumption', pet => `${pet.minutes} minutes`],
    ['Monthly budget assumption', pet => `CAD ${pet.monthly}`],
    ['Setup budget assumption', pet => `CAD ${pet.setup}`],
    ['Space assumption', pet => pet.space === 1 ? 'Small or larger' : 'Dedicated exercise area or larger'],
    ['Activity', pet => pet.activity],
    ['Research next', pet => pet.care]
  ]) {
    const row = node('tr'); const title = node('th', label); title.scope = 'row'; row.append(title);
    for (const pet of pets) row.append(node('td', read(pet))); body.append(row);
  }
  table.append(body); $('comparison-table').replaceChildren(table);
  $('announcement').textContent = `Comparing ${pets.length} options.`;
}

function renderHistory() {
  const list = $('history-list'); list.replaceChildren();
  $('clear-history').disabled = history.length === 0;
  if (!history.length) { list.append(node('p', 'No saved profiles yet. Your first search will appear here.', 'history-empty')); return; }
  for (const entry of history) {
    const current = recommend(entry.profile);
    const card = node('article', undefined, 'history-card');
    const description = node('div');
    description.append(node('h3', current.matches.length ? current.matches.map(match => match.pet.name).join(' · ') : 'No suitable match'));
    description.append(node('p', `${entry.profile.space} space · ${entry.profile.minutes} min/day · CAD ${entry.profile.monthly}/month · CAD ${entry.profile.setup} setup`));
    description.append(node('small', new Date(entry.savedAt).toLocaleString('en-CA')));
    const button = node('button', 'Revisit ↗', 'secondary'); button.type = 'button';
    button.addEventListener('click', () => {
      clearErrors();
      for (const key of PROFILE_KEYS) $(key).value = entry.profile[key];
      renderResults(current);
    });
    card.append(description, button); list.append(card);
  }
}

form.addEventListener('submit', event => {
  event.preventDefault(); clearErrors();
  const next = recommend(Object.fromEntries(new FormData(form)));
  if (!next.ok) {
    resetResults(); showErrors(next.errors); return;
  }
  renderResults(next);
  history = addHistory(history, next.profile);
  const warning = writeHistory(storage, history);
  $('storage-status').textContent = warning;
  renderHistory();
});
form.addEventListener('input', () => {
  if (result) { resetResults(); $('announcement').textContent = 'Answers changed. Search again to update your matches.'; }
});
form.addEventListener('reset', () => {
  clearErrors(); resetResults();
  $('announcement').textContent = 'Answers reset. Saved history has been kept.';
});
$('clear-history').addEventListener('click', () => { $('clear-confirm').hidden = false; $('confirm-clear').focus(); });
$('cancel-clear').addEventListener('click', () => { $('clear-confirm').hidden = true; $('clear-history').focus(); });
$('confirm-clear').addEventListener('click', () => {
  history = []; const warning = clearHistory(storage);
  $('storage-status').textContent = warning || 'Saved profiles cleared.';
  $('clear-confirm').hidden = true; renderHistory(); $('history-title').tabIndex = -1; $('history-title').focus();
});
renderHistory();
