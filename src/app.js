import { formatJson, minifyJson, parseJson } from './json-utils.js';
import { createTreeViewController } from './tree-view.js';

const editor = document.getElementById('editor');
const statusMessage = document.getElementById('statusMessage');
const treeContainer = document.getElementById('treeContainer');
const formatButton = document.getElementById('formatButton');
const minifyButton = document.getElementById('minifyButton');
const validateButton = document.getElementById('validateButton');
const sampleButton = document.getElementById('sampleButton');
const copyButton = document.getElementById('copyButton');
const downloadButton = document.getElementById('downloadButton');
const compressButton = document.getElementById('compressButton');
const toggleExpandButton = document.getElementById('toggleExpandButton');
const searchInput = document.getElementById('searchInput');

const sampleJson = `{
  "project": "JsonEditor",
  "version": 1,
  "features": [
    "format",
    "validate",
    "tree view"
  ],
  "settings": {
    "darkMode": true,
    "autoSave": false
  }
}`;

const treeView = createTreeViewController(treeContainer);
let isCompactView = false;
let currentSearch = '';

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle('error', isError);
}

function syncPreview() {
  const raw = editor.value.trim();
  if (!raw) {
    treeContainer.innerHTML = '<p class="empty-state">Start typing JSON to inspect it.</p>';
    setStatus('Ready to edit.');
    return;
  }

  const parsed = parseJson(raw);
  if (!parsed.ok) {
    setStatus(`Validation error: ${parsed.error}`, true);
    treeContainer.innerHTML = '<p class="empty-state">The JSON is invalid, so no tree preview is available yet.</p>';
    return;
  }

  treeView.setValue(parsed.value);
  treeView.setCompactView(isCompactView);
  treeView.setSearch(currentSearch);
  setStatus('JSON is valid.');
}

function applyTransform(transformer) {
  try {
    const result = transformer(editor.value);
    editor.value = result;
    syncPreview();
  } catch (error) {
    setStatus(`Unable to process JSON: ${error.message}`, true);
  }
}

function toggleCompactView() {
  isCompactView = !isCompactView;
  compressButton.textContent = isCompactView ? 'Expand View' : 'Compress';
  treeView.setCompactView(isCompactView);
}

let allExpanded = true;
function toggleExpandCollapse() {
  allExpanded = !allExpanded;
  if (allExpanded) {
    treeView.expandAll();
    toggleExpandButton.textContent = '⇅ Collapse All';
  } else {
    treeView.collapseAll();
    toggleExpandButton.textContent = '↕ Expand All';
  }
}

formatButton.addEventListener('click', () => {
  applyTransform(formatJson);
});

minifyButton.addEventListener('click', () => {
  applyTransform(minifyJson);
});

validateButton.addEventListener('click', () => {
  syncPreview();
});

sampleButton.addEventListener('click', () => {
  editor.value = sampleJson;
  syncPreview();
});

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(editor.value);
    setStatus('Copied to clipboard.');
  } catch {
    setStatus('Clipboard access is not available in this browser.', true);
  }
});

downloadButton.addEventListener('click', () => {
  const blob = new Blob([editor.value], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'document.json';
  link.click();
  URL.revokeObjectURL(link.href);
});

compressButton.addEventListener('click', toggleCompactView);
toggleExpandButton.addEventListener('click', toggleExpandCollapse);
searchInput.addEventListener('input', () => {
  currentSearch = searchInput.value;
  treeView.setSearch(currentSearch);
});

editor.addEventListener('input', syncPreview);

editor.value = sampleJson;
syncPreview();

// Start with the tree expanded so the first user action will collapse it.
try {
  treeView.expandAll();
  toggleExpandButton.textContent = '⇅ Collapse All';
} catch (e) {
  // ignore if treeView not ready
}
