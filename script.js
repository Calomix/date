// ╔══════════════════════════════════════════════════════════════════╗
// ║  Easter eggs para la ingeniera más curiosa 👀                    ║
// ║  Si estás leyendo esto, felicitaciones: encontraste el código.   ║
// ╚══════════════════════════════════════════════════════════════════╝

console.log(
  '%cHola, inspectora 💻',
  'font-size: 24px; font-weight: bold; color: #ff7aa2; text-shadow: 2px 2px #ffd8be;'
);
console.log(
  '%cSabía que ibas a abrir esto. Yo también estoy emocionado 🥰',
  'font-size: 14px; color: #8a7a80;'
);
console.log(
  '%cPista: probá escribir %csecreto %cen la consola.',
  'font-size: 13px; color: #5a4a4f;',
  'font-size: 13px; color: #b388ff; font-weight: bold;',
  'font-size: 13px; color: #5a4a4f;'
);

function showSecretMessage() {
  console.log(
    '%c💕 Nuestra cita va a ser perfecta porque la armamos juntos. 💕',
    'font-size: 18px; font-weight: bold; color: #ff7aa2; padding: 8px 12px; border: 2px dashed #ff9ebb; border-radius: 12px; background: #fff0f5;'
  );
  return 'besitos de mi parte 😘';
}

window.mensajeSecreto = showSecretMessage;

Object.defineProperty(window, 'secreto', {
  get: function() {
    return showSecretMessage();
  }
});

// ═══════════════════════════════════════════════════════════════════
// Configuración
// ═══════════════════════════════════════════════════════════════════

const defaultVersion = {
  id: 'default',
  name: 'Default',
  inviteTitle: '¿Quieres salir conmigo?',
  inviteSubtitle: 'Tengo ganas de verte y quiero que coordinemos todo juntos.',
  notePlaceholder: 'Ej: me muero de ganas de verte ✨',
  noMessages: ['No 💔', '¿Segura?', '¿Segurísima? 🥺', '¿Cómo que no? 😏', 'Pensalo bien 💭'],
  steps: [
    { key: 'food', emoji: '🍽️', title: '¿Qué se te antoja?', subtitle: 'Elige lo que más te provoque', gridClass: 'options-grid', options: ['Pizza 🍕', 'Hamburguesas 🍔', 'Al plato 🍽️', 'Lo que sea mientras sea contigo ✨'] },
    { key: 'time', emoji: '🕖', title: '¿A qué hora te busco mañana?', subtitle: 'O si preferís encontrarnos', gridClass: 'options-grid', options: ['19:00 🕖', '20:00 🕗', '20:30 🕣', 'Nos encontramos allí 🚶'] },
    { key: 'plan', emoji: '✨', title: '¿Qué onda el plan?', subtitle: 'Contame qué te pinta', gridClass: 'options-grid', options: ['Cenar 🍷', 'Tomar algo 🧉', 'Pasear 🌙', 'Sorpresa 🎁'] },
    { key: 'vibe', emoji: '🌿', title: '¿Ambiente?', subtitle: 'Elige la onda de la salida', gridClass: 'options-grid-three', options: ['Tranqui 🌿', 'Animado 🎉', 'Íntimo 🕯️'] }
  ]
};

const defaultConfig = {
  telegramBotToken: '',
  telegramChatId: '',
  versions: [JSON.parse(JSON.stringify(defaultVersion))]
};

function migrateConfig(input) {
  if (!input) return JSON.parse(JSON.stringify(defaultConfig));

  // Si ya tiene versions, está en el nuevo formato
  if (Array.isArray(input.versions) && input.versions.length > 0) {
    return {
      telegramBotToken: input.telegramBotToken || '',
      telegramChatId: input.telegramChatId || '',
      versions: input.versions.map(v => ({ ...defaultVersion, ...v }))
    };
  }

  // Formato legacy: convertir a una única versión default
  const legacyVersion = {
    id: 'default',
    name: 'Default',
    inviteTitle: input.inviteTitle || defaultVersion.inviteTitle,
    inviteSubtitle: input.inviteSubtitle || defaultVersion.inviteSubtitle,
    notePlaceholder: input.notePlaceholder || defaultVersion.notePlaceholder,
    noMessages: input.noMessages || [...defaultVersion.noMessages],
    steps: [
      { key: 'food', emoji: '🍽️', title: '¿Qué se te antoja?', subtitle: 'Elige lo que más te provoque', gridClass: 'options-grid', options: input.food || [...defaultVersion.steps[0].options] },
      { key: 'time', emoji: '🕖', title: '¿A qué hora te busco mañana?', subtitle: 'O si preferís encontrarnos', gridClass: 'options-grid', options: input.time || [...defaultVersion.steps[1].options] },
      { key: 'plan', emoji: '✨', title: '¿Qué onda el plan?', subtitle: 'Contame qué te pinta', gridClass: 'options-grid', options: input.plan || [...defaultVersion.steps[2].options] },
      { key: 'vibe', emoji: '🌿', title: '¿Ambiente?', subtitle: 'Elige la onda de la salida', gridClass: 'options-grid-three', options: input.vibe || [...defaultVersion.steps[3].options] }
    ]
  };

  return {
    telegramBotToken: input.telegramBotToken || '',
    telegramChatId: input.telegramChatId || '',
    versions: [legacyVersion]
  };
}

let config = migrateConfig(loadSavedConfig() || loadConfig() || { ...defaultConfig });
let activeVersion = getActiveVersion();
let selections = {};
((activeVersion || getDefaultVersion()).steps || []).forEach(step => selections[step.key] = null);
let currentStep = 0;
let noMessageIndex = 0;
let editingVersionIndex = 0;

function hasVersionParam() {
  const params = new URLSearchParams(window.location.search);
  const versionId = params.get('v');
  const versionName = params.get('n');
  return !!(versionId || versionName);
}

function getActiveVersion() {
  const params = new URLSearchParams(window.location.search);
  const versionId = params.get('v');
  const versionName = params.get('n');

  // Si no se especifica versión, no se muestra ningún formulario
  if (!versionId && !versionName) return null;

  if (versionId && config.versions) {
    const found = config.versions.find(v => v.id === versionId);
    if (found) return found;
  }

  if (versionName && config.versions) {
    const normalized = versionName.toLowerCase().trim();
    const found = config.versions.find(v => v.name.toLowerCase().trim() === normalized || v.id.toLowerCase().trim() === normalized);
    if (found) return found;
  }

  // Versión solicitada pero no encontrada -> tampoco se muestra formulario
  return null;
}

function getDefaultVersion() {
  return config.versions?.[0] || JSON.parse(JSON.stringify(defaultVersion));
}

// Referencias DOM
const configScreen = document.getElementById('config-screen');
const landingScreen = document.getElementById('landing-screen');
const inviteScreen = document.getElementById('invite-screen');
const detailsScreen = document.getElementById('details-screen');
const resultScreen = document.getElementById('result-screen');

const inviteTitle = document.getElementById('invite-title');
const inviteSubtitle = document.getElementById('invite-subtitle');
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const btnBack = document.getElementById('btn-back');
const btnShareImage = document.getElementById('btn-share-image');
const btnRestart = document.getElementById('btn-restart');
const summaryList = document.getElementById('summary-list');
const shareCanvas = document.getElementById('share-canvas');

const cfgInviteTitle = document.getElementById('cfg-invite-title');
const cfgInviteSubtitle = document.getElementById('cfg-invite-subtitle');
const cfgNotePlaceholder = document.getElementById('cfg-note-placeholder');
const cfgNoMessages = document.getElementById('cfg-no-messages');
const cfgGitHubToken = document.getElementById('cfg-github-token');
const cfgTelegramBotToken = document.getElementById('cfg-telegram-bot-token');
const cfgTelegramChatId = document.getElementById('cfg-telegram-chat-id');
const cfgVersionSelector = document.getElementById('cfg-version-selector');
const cfgVersionId = document.getElementById('cfg-version-id');
const cfgVersionName = document.getElementById('cfg-version-name');
const stepsEditor = document.getElementById('steps-editor');
const btnAddStep = document.getElementById('btn-add-step');
const btnAddVersion = document.getElementById('btn-add-version');
const btnDuplicateVersion = document.getElementById('btn-duplicate-version');
const btnDeleteVersion = document.getElementById('btn-delete-version');
const btnSaveConfig = document.getElementById('btn-save-config');
const btnDefaultConfig = document.getElementById('btn-default-config');

// ═══════════════════════════════════════════════════════════════════
// Utilidades
// ═══════════════════════════════════════════════════════════════════

function loadSavedConfig() {
  // config.js puede exportar savedConfig; si existe y no es null, tiene prioridad
  if (typeof savedConfig !== 'undefined' && savedConfig) {
    return savedConfig;
  }
  return null;
}

function loadConfig() {
  try {
    const saved = localStorage.getItem('dateConfig');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}

function saveConfig() {
  try {
    localStorage.setItem('dateConfig', JSON.stringify(config));
  } catch (e) {
    // ignorar
  }
}

function loadGitHubToken() {
  try {
    return localStorage.getItem('dateGitHubToken');
  } catch (e) {
    return null;
  }
}

function saveGitHubToken(token) {
  try {
    if (token) {
      localStorage.setItem('dateGitHubToken', token);
    } else {
      localStorage.removeItem('dateGitHubToken');
    }
  } catch (e) {
    // ignorar
  }
}

function buildConfigJsContent() {
  const configObject = {
    telegramBotToken: config.telegramBotToken || '',
    telegramChatId: config.telegramChatId || '',
    versions: config.versions || []
  };

  return `// Configuración guardada del sitio.\n// Se actualiza automáticamente desde la web y se sincroniza por GitHub.\nconst savedConfig = ${JSON.stringify(configObject, null, 2)};\n`;
}

function exportConfigFile() {
  const content = buildConfigJsContent();
  const blob = new Blob([content], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'config.js';
  link.click();
  URL.revokeObjectURL(url);
}

function utf8ToBase64(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1)));
}

async function uploadConfigToGitHub(token) {
  const owner = 'Calomix';
  const repo = 'date';
  const path = 'config.js';
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const content = buildConfigJsContent();

  // Obtener el SHA actual del archivo (si existe)
  let sha = null;
  const getResponse = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (getResponse.ok) {
    const data = await getResponse.json();
    sha = data.sha;
  } else if (getResponse.status !== 404) {
    throw new Error(`No se pudo leer el archivo de GitHub: ${getResponse.status}`);
  }

  // Subir el archivo actualizado
  const body = {
    message: 'Update config from web',
    content: utf8ToBase64(content),
    sha: sha
  };

  const putResponse = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!putResponse.ok) {
    const error = await putResponse.json().catch(() => ({}));
    throw new Error(error.message || `Error ${putResponse.status} al subir a GitHub`);
  }
}

function parseOptions(text) {
  return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

function parseNoMessages(text) {
  return text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
}

function splitEmojiAndText(option) {
  // Separa el último emoji del texto (ej: "Pizza 🍕" -> {emoji: "🍕", text: "Pizza"})
  // Soporta emojis con selector de variación (VS16 \uFE0F), ZWJ sequences y tonos de piel.
  const emojiRegex = /([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}])(?:\uFE0F|\u200D[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]|[\u{1F3FB}-\u{1F3FF}])*/gu;
  const matches = Array.from(option.matchAll(emojiRegex));
  if (matches.length > 0) {
    const lastMatch = matches[matches.length - 1];
    const emoji = lastMatch[0];
    const emojiEnd = lastMatch.index + emoji.length;
    // Solo separamos si el emoji está al final (ignorando espacios)
    if (option.slice(emojiEnd).trim() === '') {
      const text = option.slice(0, lastMatch.index).trim();
      return { emoji, text };
    }
  }
  return { emoji: '✨', text: option.trim() };
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showScreen(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

// ═══════════════════════════════════════════════════════════════════
// Configuración
// ═══════════════════════════════════════════════════════════════════

function updateVersionSelector() {
  if (!cfgVersionSelector) return;
  cfgVersionSelector.innerHTML = '';
  config.versions.forEach((version, idx) => {
    const option = document.createElement('option');
    option.value = idx;
    option.textContent = version.name || version.id || `Versión ${idx + 1}`;
    if (idx === editingVersionIndex) option.selected = true;
    cfgVersionSelector.appendChild(option);
  });
}

const EMOJI_LIST = ['🍽️','🕖','✨','🌿','💌','🍕','🍔','🍣','🥗','🥞','🌮','🍝','☕','🍷','🍻','🥂','🍾','🎬','🎵','🎤','🎮','📚','🎨','🎭','🎪','🎉','🎈','🌙','🌳','🏠','🏖️','✈️','🚗','🚲','🛵','🎁','🌹','💖','💕','🫶','😊','🥰','😎','🤔','😏','🥺','💭','❤️','🔥','⭐','🌟','💫','🎯','🎳','🎲','🏓','⚽','🏀','🚶','🧩','🎸','🎹','🎺','🎻'];

function createEmojiPicker(currentEmoji, onSelect) {
  const picker = document.createElement('div');
  picker.className = 'emoji-picker';
  EMOJI_LIST.forEach(emoji => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = emoji;
    btn.title = emoji;
    if (emoji === currentEmoji) btn.style.background = '#f3e5f5';
    btn.addEventListener('click', () => onSelect(emoji));
    picker.appendChild(btn);
  });
  return picker;
}

function createOptionInput(value) {
  const row = document.createElement('div');
  row.className = 'step-editor-option';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Opción (ej: Pizza 🍕)';
  input.value = value || '';

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn-remove-option';
  removeBtn.textContent = '×';
  removeBtn.title = 'Eliminar opción';
  removeBtn.addEventListener('click', () => row.remove());

  row.appendChild(input);
  row.appendChild(removeBtn);
  return row;
}

function updateStepIndices() {
  if (!stepsEditor) return;
  Array.from(stepsEditor.children).forEach((child, idx) => {
    if (child.classList.contains('step-editor-item')) {
      child.dataset.index = idx;
    }
  });
}

function createStepEditor(step, idx) {
  const item = document.createElement('div');
  item.className = 'step-editor-item';
  item.draggable = true;
  item.dataset.index = idx;
  item.dataset.key = step.key || '';

  // Header
  const header = document.createElement('div');
  header.className = 'step-editor-header';

  const emojiBtn = document.createElement('button');
  emojiBtn.type = 'button';
  emojiBtn.className = 'step-editor-emoji';
  emojiBtn.textContent = step.emoji || '✨';
  emojiBtn.dataset.field = 'emoji';
  emojiBtn.title = 'Cambiar emoji';

  const fields = document.createElement('div');
  fields.className = 'step-editor-fields';

  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.placeholder = 'Título del paso';
  titleInput.value = step.title || '';
  titleInput.dataset.field = 'title';

  const subtitleInput = document.createElement('input');
  subtitleInput.type = 'text';
  subtitleInput.placeholder = 'Subtítulo';
  subtitleInput.value = step.subtitle || '';
  subtitleInput.dataset.field = 'subtitle';

  const gridSelect = document.createElement('select');
  gridSelect.dataset.field = 'gridClass';
  [
    { value: 'options-grid', label: '2 columnas' },
    { value: 'options-grid-three', label: '3 columnas' },
    { value: 'options-stack', label: 'Lista vertical' }
  ].forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    if (opt.value === step.gridClass) option.selected = true;
    gridSelect.appendChild(option);
  });

  fields.appendChild(titleInput);
  fields.appendChild(subtitleInput);
  fields.appendChild(gridSelect);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'step-editor-remove';
  removeBtn.textContent = '🗑';
  removeBtn.title = 'Eliminar paso';

  header.appendChild(emojiBtn);
  header.appendChild(fields);
  header.appendChild(removeBtn);

  // Options
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'step-editor-options';

  const optionsLabel = document.createElement('div');
  optionsLabel.className = 'step-editor-options-label';
  optionsLabel.textContent = 'Opciones';
  optionsContainer.appendChild(optionsLabel);

  (step.options || ['']).forEach(opt => {
    optionsContainer.appendChild(createOptionInput(opt));
  });

  const addOptionBtn = document.createElement('button');
  addOptionBtn.type = 'button';
  addOptionBtn.className = 'btn btn-secondary btn-add-option';
  addOptionBtn.textContent = '+ Agregar opción';
  optionsContainer.appendChild(addOptionBtn);

  // Picker container (se llena al hacer click)
  const pickerContainer = document.createElement('div');
  pickerContainer.className = 'emoji-picker-container';

  item.appendChild(header);
  item.appendChild(pickerContainer);
  item.appendChild(optionsContainer);

  // Events
  emojiBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const existing = pickerContainer.querySelector('.emoji-picker');
    if (existing) {
      existing.remove();
      return;
    }
    document.querySelectorAll('.emoji-picker').forEach(p => p.remove());
    const picker = createEmojiPicker(emojiBtn.textContent, (emoji) => {
      emojiBtn.textContent = emoji;
      picker.remove();
    });
    pickerContainer.appendChild(picker);
  });

  removeBtn.addEventListener('click', () => {
    item.remove();
    updateStepIndices();
  });

  addOptionBtn.addEventListener('click', () => {
    const optEl = createOptionInput('');
    optionsContainer.insertBefore(optEl, addOptionBtn);
    optEl.querySelector('input').focus();
  });

  // Drag and drop
  item.addEventListener('dragstart', (e) => {
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.dataset.index);
  });

  item.addEventListener('dragend', () => {
    item.classList.remove('dragging');
    document.querySelectorAll('.step-editor-item').forEach(el => el.classList.remove('drag-over'));
    updateStepIndices();
  });

  item.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    item.classList.add('drag-over');
  });

  item.addEventListener('dragleave', () => {
    item.classList.remove('drag-over');
  });

  item.addEventListener('drop', (e) => {
    e.preventDefault();
    item.classList.remove('drag-over');
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    const toIndex = parseInt(item.dataset.index, 10);
    if (isNaN(fromIndex) || isNaN(toIndex) || fromIndex === toIndex) return;

    const items = Array.from(stepsEditor.querySelectorAll('.step-editor-item'));
    const fromEl = items[fromIndex];
    if (!fromEl) return;

    if (toIndex > fromIndex) {
      item.parentNode.insertBefore(fromEl, item.nextSibling);
    } else {
      item.parentNode.insertBefore(fromEl, item);
    }
    updateStepIndices();
  });

  return item;
}

function renderStepsEditor() {
  if (!stepsEditor) return;
  stepsEditor.innerHTML = '';
  const version = config.versions[editingVersionIndex] || config.versions[0];
  const steps = version.steps || [];
  steps.forEach((step, idx) => {
    stepsEditor.appendChild(createStepEditor(step, idx));
  });
}

function readStepsFromEditor() {
  if (!stepsEditor) return [];
  const steps = [];
  Array.from(stepsEditor.querySelectorAll('.step-editor-item')).forEach(child => {
    const emojiEl = child.querySelector('[data-field="emoji"]');
    const titleEl = child.querySelector('[data-field="title"]');
    const subtitleEl = child.querySelector('[data-field="subtitle"]');
    const gridClassEl = child.querySelector('[data-field="gridClass"]');

    const title = titleEl ? titleEl.value.trim() : '';
    if (!title) return;

    const options = [];
    child.querySelectorAll('.step-editor-option input').forEach(input => {
      if (input.value.trim()) options.push(input.value.trim());
    });

    steps.push({
      key: child.dataset.key || `step_${Math.random().toString(36).substr(2, 8)}`,
      emoji: emojiEl ? emojiEl.textContent.trim() : '✨',
      title,
      subtitle: subtitleEl ? subtitleEl.value.trim() : '',
      gridClass: gridClassEl ? gridClassEl.value : 'options-grid',
      options: options.length ? options : ['']
    });
  });
  return steps;
}

function fillConfigForm() {
  const version = config.versions[editingVersionIndex] || config.versions[0];

  cfgInviteTitle.value = version.inviteTitle;
  cfgInviteSubtitle.value = version.inviteSubtitle;
  cfgNotePlaceholder.value = version.notePlaceholder;
  cfgNoMessages.value = version.noMessages.join('\n');
  cfgTelegramBotToken.value = config.telegramBotToken || '';
  cfgTelegramChatId.value = config.telegramChatId || '';
  cfgVersionId.value = version.id;
  cfgVersionName.value = version.name;
  cfgGitHubToken.value = loadGitHubToken() || '';

  updateVersionSelector();
  renderStepsEditor();
}

function readConfigForm() {
  const version = config.versions[editingVersionIndex] || config.versions[0];

  version.id = cfgVersionId.value.trim() || version.id;
  version.name = cfgVersionName.value.trim() || version.name;
  version.inviteTitle = cfgInviteTitle.value.trim() || defaultVersion.inviteTitle;
  version.inviteSubtitle = cfgInviteSubtitle.value.trim() || defaultVersion.inviteSubtitle;
  version.notePlaceholder = cfgNotePlaceholder.value.trim() || defaultVersion.notePlaceholder;
  version.noMessages = parseNoMessages(cfgNoMessages.value);
  version.steps = readStepsFromEditor();

  return {
    telegramBotToken: cfgTelegramBotToken.value.trim(),
    telegramChatId: cfgTelegramChatId.value.trim(),
    versions: config.versions
  };
}

function renderTemplate(text, version) {
  return text.replace(/\{\{name\}\}/g, version.name);
}

function applyConfig() {
  activeVersion = getActiveVersion();

  if (activeVersion) {
    inviteTitle.textContent = renderTemplate(activeVersion.inviteTitle, activeVersion);
    inviteSubtitle.textContent = renderTemplate(activeVersion.inviteSubtitle, activeVersion);
    generateWizard();
  }
}

function isConfigMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('config') === '1';
}

function exitConfigMode() {
  const url = new URL(window.location.href);
  url.searchParams.delete('config');
  window.history.replaceState({}, '', url.toString());
}

btnSaveConfig.addEventListener('click', async () => {
  config = readConfigForm();

  // Asegurar que cada versión tenga noMessages válidos
  config.versions.forEach(version => {
    if (!version.noMessages || version.noMessages.length === 0) {
      version.noMessages = [...defaultVersion.noMessages];
    }
    if (!version.steps || version.steps.length === 0) {
      version.steps = JSON.parse(JSON.stringify(defaultVersion.steps));
    }
  });

  const token = cfgGitHubToken.value.trim();
  saveGitHubToken(token);
  saveConfig();

  if (token) {
    try {
      await uploadConfigToGitHub(token);
      alert('Configuración guardada en GitHub ✨');
    } catch (err) {
      console.error('Error subiendo a GitHub:', err);
      alert('No se pudo subir a GitHub. Se descargó el archivo para que lo subas manualmente.\n\n' + err.message);
      exportConfigFile();
    }
  } else {
    exportConfigFile();
  }

  applyConfig();
  exitConfigMode();
  showScreen(inviteScreen);
});

btnDefaultConfig.addEventListener('click', () => {
  config = JSON.parse(JSON.stringify(defaultConfig));
  editingVersionIndex = 0;
  fillConfigForm();
});

if (cfgVersionSelector) {
  cfgVersionSelector.addEventListener('change', () => {
    editingVersionIndex = parseInt(cfgVersionSelector.value, 10) || 0;
    fillConfigForm();
  });
}

if (btnAddVersion) {
  btnAddVersion.addEventListener('click', () => {
    const newVersion = JSON.parse(JSON.stringify(defaultVersion));
    newVersion.id = `version${config.versions.length + 1}`;
    newVersion.name = `Versión ${config.versions.length + 1}`;
    config.versions.push(newVersion);
    editingVersionIndex = config.versions.length - 1;
    fillConfigForm();
  });
}

if (btnDuplicateVersion) {
  btnDuplicateVersion.addEventListener('click', () => {
    const current = config.versions[editingVersionIndex];
    if (!current) return;
    const copy = JSON.parse(JSON.stringify(current));
    copy.id = `${current.id}-copy`;
    copy.name = `${current.name} (copia)`;
    config.versions.push(copy);
    editingVersionIndex = config.versions.length - 1;
    fillConfigForm();
  });
}

if (btnDeleteVersion) {
  btnDeleteVersion.addEventListener('click', () => {
    if (config.versions.length <= 1) {
      alert('Tiene que haber al menos una versión.');
      return;
    }
    if (!confirm('¿Seguro que querés eliminar esta versión?')) return;
    config.versions.splice(editingVersionIndex, 1);
    editingVersionIndex = Math.max(0, editingVersionIndex - 1);
    fillConfigForm();
  });

  if (btnAddStep) {
    btnAddStep.addEventListener('click', () => {
      const stepEl = createStepEditor({
        emoji: '✨',
        title: '',
        subtitle: '',
        gridClass: 'options-grid',
        options: ['']
      }, stepsEditor ? stepsEditor.children.length : 0);
      if (stepsEditor) {
        stepsEditor.appendChild(stepEl);
        stepEl.querySelector('[data-field="title"]')?.focus();
      }
    });
  }
}



// ═══════════════════════════════════════════════════════════════════
// Invitación y botón No
// ═══════════════════════════════════════════════════════════════════

function moveNoButton() {
  const container = inviteScreen.querySelector('.invite-card');
  const rect = container.getBoundingClientRect();
  const noRect = btnNo.getBoundingClientRect();
  const yesRect = btnYes.getBoundingClientRect();

  const margin = 16;

  // Área disponible para que el botón No quede completamente dentro de la tarjeta
  const minLeft = 0;
  const minTop = 0;
  const maxLeft = rect.width - noRect.width;
  const maxTop = rect.height - noRect.height;

  // Zona que debe evitar el botón No: el botón Sí + un margen de seguridad
  const forbidden = {
    left: yesRect.left - rect.left - margin,
    top: yesRect.top - rect.top - margin,
    right: yesRect.right - rect.left + margin,
    bottom: yesRect.bottom - rect.top + margin
  };

  let randomLeft, randomTop;
  let attempts = 0;
  const maxAttempts = 60;
  let bestPos = null;
  let bestDistance = -1;

  do {
    randomLeft = Math.random() * (maxLeft - minLeft) + minLeft;
    randomTop = Math.random() * (maxTop - minTop) + minTop;
    attempts++;

    const overlaps = (
      randomLeft < forbidden.right &&
      randomLeft + noRect.width > forbidden.left &&
      randomTop < forbidden.bottom &&
      randomTop + noRect.height > forbidden.top
    );

    if (!overlaps) {
      // Guardar la posición válida más alejada del Sí como respaldo
      const noCx = randomLeft + noRect.width / 2;
      const noCy = randomTop + noRect.height / 2;
      const yesCx = (yesRect.left - rect.left) + yesRect.width / 2;
      const yesCy = (yesRect.top - rect.top) + yesRect.height / 2;
      const dist = Math.hypot(noCx - yesCx, noCy - yesCy);

      if (dist > bestDistance) {
        bestDistance = dist;
        bestPos = { left: randomLeft, top: randomTop };
      }
    }
  } while (attempts < maxAttempts);

  // Si encontramos al menos una posición válida, usamos la más alejada del Sí.
  // Si no, caemos en la esquina del contenedor más lejana del Sí para evitar superposición.
  const finalPos = bestPos || {
    left: (yesRect.left - rect.left) + yesRect.width / 2 > rect.width / 2 ? minLeft : maxLeft,
    top: (yesRect.top - rect.top) + yesRect.height / 2 > rect.height / 2 ? minTop : maxTop
  };

  btnNo.style.position = 'absolute';
  btnNo.style.left = `${finalPos.left}px`;
  btnNo.style.top = `${finalPos.top}px`;

  // Primer mensaje siempre es "No 💔", luego cicla por el resto
  const versionMessages = activeVersion.noMessages || defaultVersion.noMessages;
  if (noMessageIndex === 0) {
    btnNo.textContent = versionMessages[0] || 'No 💔';
    noMessageIndex = 1;
  } else {
    const messages = versionMessages.slice(1);
    const idx = (noMessageIndex - 1) % messages.length;
    btnNo.textContent = messages[idx] || 'No 💔';
    noMessageIndex = ((noMessageIndex - 1) + 1) % messages.length + 1;
  }
}

btnNo.addEventListener('mouseover', moveNoButton);
btnNo.addEventListener('touchstart', (e) => {
  e.preventDefault();
  moveNoButton();
}, { passive: false });
btnNo.addEventListener('touchmove', (e) => {
  e.preventDefault();
}, { passive: false });
btnNo.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  moveNoButton();
});
btnNo.addEventListener('click', (e) => {
  e.preventDefault();
  moveNoButton();
});

btnYes.addEventListener('click', () => {
  activeVersion = getActiveVersion();
  if (!activeVersion) return;
  currentStep = 0;
  selections = {};
  (activeVersion.steps || []).forEach(step => selections[step.key] = null);
  updateWizard();
  showScreen(detailsScreen);
});

// ═══════════════════════════════════════════════════════════════════
// Wizard dinámico
// ═══════════════════════════════════════════════════════════════════

function generateWizard() {
  const stepsContainer = document.getElementById('wizard-steps');
  const dotsContainer = document.getElementById('progress-dots');
  const steps = activeVersion.steps || [];
  const totalSteps = steps.length + 1; // +1 por la notita

  stepsContainer.innerHTML = '';
  dotsContainer.innerHTML = '';

  steps.forEach((step, idx) => {
    // Dots
    const dot = document.createElement('span');
    dot.className = 'dot' + (idx === 0 ? ' active' : '');
    dot.dataset.step = idx;
    dotsContainer.appendChild(dot);

    // Step
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step' + (idx === 0 ? ' active' : '');
    stepDiv.dataset.step = idx;

    const isGridThree = step.gridClass === 'options-grid-three';
    const isWideLast = isGridThree && step.options.length % 2 === 1;

    let optionsHtml = '';
    step.options.forEach((opt, optIdx) => {
      const parts = splitEmojiAndText(opt);
      const wideClass = isWideLast && optIdx === step.options.length - 1 ? ' option-wide' : '';
      optionsHtml += `
        <button class="option-big${wideClass}" data-value="${escapeHtml(parts.text)}">
          <span class="opt-emoji">${parts.emoji}</span>
          <span>${escapeHtml(parts.text)}</span>
        </button>
      `;
    });

    stepDiv.innerHTML = `
      <div class="step-emoji">${step.emoji}</div>
      <h2>${escapeHtml(step.title)}</h2>
      <p class="subtitle">${escapeHtml(step.subtitle)}</p>
      <div class="options-stack ${step.gridClass}" data-name="${step.key}">
        ${optionsHtml}
      </div>
    `;

    stepsContainer.appendChild(stepDiv);
  });

  // Paso de notita
  const noteStep = document.createElement('div');
  noteStep.className = 'step';
  noteStep.dataset.step = steps.length;
  noteStep.innerHTML = `
    <div class="step-emoji">💌</div>
    <h2>Una notita para mí</h2>
    <p class="subtitle">Opcional, pero me encantaría leerte</p>
    <textarea id="note" rows="4" maxlength="200" placeholder="${escapeHtml(activeVersion.notePlaceholder)}"></textarea>
    <div class="char-counter" id="note-counter">0/200</div>
    <button id="btn-summary" class="btn btn-primary">Enviar y ver resumen 💕</button>
  `;
  stepsContainer.appendChild(noteStep);

  const noteDot = document.createElement('span');
  noteDot.className = 'dot';
  noteDot.dataset.step = steps.length;
  dotsContainer.appendChild(noteDot);

  // Reatachar eventos
  document.querySelectorAll('.options-stack').forEach(group => {
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('.option-big');
      if (!btn) return;

      const name = group.dataset.name;
      group.querySelectorAll('.option-big').forEach(opt => opt.classList.remove('selected'));
      btn.classList.add('selected');
      selections[name] = btn.dataset.value;

      setTimeout(nextStep, 220);
    });
  });

  document.getElementById('btn-summary').addEventListener('click', () => {
    buildSummary();
    showScreen(resultScreen);
    startConfetti();
    sendResponseToTelegram();
  });

  const noteInput = document.getElementById('note');
  const noteCounter = document.getElementById('note-counter');
  if (noteInput && noteCounter) {
    noteInput.addEventListener('input', () => {
      noteCounter.textContent = `${noteInput.value.length}/200`;
    });
  }
}

function updateWizard() {
  const steps = activeVersion.steps || [];

  document.querySelectorAll('.step').forEach((step, idx) => {
    step.classList.toggle('active', idx === currentStep);
  });
  document.querySelectorAll('.dot').forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentStep);
  });
  btnBack.classList.toggle('hidden', currentStep === 0);

  const name = steps[currentStep]?.key;
  if (name) {
    const group = document.querySelector(`.options-stack[data-name="${name}"]`);
    if (group) {
      group.querySelectorAll('.option-big').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.value === selections[name]);
      });
    }
  }
}

function nextStep() {
  if (currentStep < activeVersion.steps.length) {
    currentStep++;
    updateWizard();
  }
}

function prevStep() {
  if (currentStep > 0) {
    currentStep--;
    updateWizard();
  }
}

btnBack.addEventListener('click', prevStep);

// ═══════════════════════════════════════════════════════════════════
// Resumen y share
// ═══════════════════════════════════════════════════════════════════

function getSummaryData() {
  const data = [];
  (activeVersion.steps || []).forEach(step => {
    if (selections[step.key]) {
      data.push({ label: step.title, value: selections[step.key] });
    }
  });
  const note = document.getElementById('note')?.value.trim();
  if (note) {
    data.push({ label: 'Notita 💌', value: note });
  }
  return data;
}

function buildSummary() {
  const data = getSummaryData();
  summaryList.innerHTML = data.map(item => `
    <div class="summary-item">
      <span class="summary-label">${escapeHtml(item.label)}</span>
      <span class="summary-value">${escapeHtml(item.value)}</span>
    </div>
  `).join('');
}

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

async function sendResponseToTelegram() {
  const token = config.telegramBotToken?.trim();
  const chatId = config.telegramChatId?.trim();
  if (!token || !chatId) {
    console.log('[Telegram] No hay token o chatId configurado.');
    return;
  }

  const data = getSummaryData();
  const note = document.getElementById('note')?.value.trim() || '';
  let details = '';
  data.forEach(item => {
    details += `• ${item.label}: ${item.value}\n`;
  });

  const message = `💕 *Nueva respuesta* 💕\n\n` +
    `*Versión:* ${activeVersion.name}\n` +
    `*Fecha:* ${formatDate(new Date())}\n\n` +
    `${details}` +
    (note ? `\n💌 *Notita:* ${note}` : '');

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const result = await response.json();
    console.log('[Telegram] Respuesta:', result);

    if (!response.ok || !result.ok) {
      console.warn('[Telegram] Error:', result);
    }
  } catch (err) {
    console.error('[Telegram] Error de red:', err);
  }
}

function buildShareText() {
  const data = getSummaryData();
  let text = '¡Tenemos una cita! 💕\n\n';
  data.forEach(item => {
    text += `${item.label}: ${item.value}\n`;
  });
  text += '\n¿Te parece? 😊';
  return text;
}

btnShareImage.addEventListener('click', async () => {
  try {
    await shareImageFile();
  } catch (err) {
    console.error('Error al compartir:', err);
  }
});

async function shareImageFile() {
  const dataUrl = await drawShareImage();
  const blob = dataUrlToBlob(dataUrl);
  const file = new File([blob], 'nuestra-cita.png', { type: 'image/png', lastModified: Date.now() });

  // Compartir nativamente solo la imagen (sin texto adicional)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file] });
    return true;
  }

  return false;
}

function downloadImage() {
  drawShareImage().then(dataUrl => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'nuestra-cita.png';
    link.click();
  });
}

function dataUrlToBlob(dataUrl) {
  const byteString = atob(dataUrl.split(',')[1]);
  const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

btnRestart.addEventListener('click', () => {
  selections = {};
  (activeVersion.steps || []).forEach(step => selections[step.key] = null);
  noMessageIndex = 0;
  stopConfetti();
  showScreen(inviteScreen);
});

// ═══════════════════════════════════════════════════════════════════
// Generar imagen del resumen
// ═══════════════════════════════════════════════════════════════════

function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if (!word) continue;
    const testLine = currentLine ? currentLine + ' ' + word : word;
    if (ctx.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);

      // Si una sola palabra excede el ancho, la cortamos carácter a carácter
      if (ctx.measureText(word).width > maxWidth) {
        let partial = '';
        for (const char of word) {
          const testPartial = partial + char;
          if (ctx.measureText(testPartial).width <= maxWidth) {
            partial = testPartial;
          } else {
            if (partial) lines.push(partial);
            partial = char;
          }
        }
        currentLine = partial;
      } else {
        currentLine = word;
      }
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawShareImage() {
  return new Promise((resolve) => {
    const canvas = shareCanvas;
    const ctx = canvas.getContext('2d');
    const width = 1080;

    // Configuración del layout de tarjetas
    const normalCardWidth = 460;
    const noteCardWidth = 950; // ancho completo (dos columnas)
    const baseCardHeight = 240;
    const gapX = 30;
    const gapY = 30;
    const startX = (width - (normalCardWidth * 2 + gapX)) / 2;
    const startY = 330;
    const valueLineHeight = 48;

    const data = getSummaryData();

    // Separar la notita (siempre va al final) del resto de items
    const normalItems = [];
    let noteItem = null;
    data.forEach(item => {
      if (item.label === 'Notita 💌') {
        noteItem = item;
      } else {
        normalItems.push(item);
      }
    });

    // Precalcular líneas y altura de las tarjetas normales
    ctx.font = 'bold 38px Quicksand, sans-serif';
    const normalCards = normalItems.map(item => {
      const lines = wrapText(ctx, item.value, normalCardWidth - 60);
      const neededHeight = lines.length <= 1
        ? baseCardHeight
        : 212 + lines.length * valueLineHeight + 28;
      const height = Math.max(baseCardHeight, neededHeight);
      return { ...item, lines, height };
    });

    // Calcular altura de cada fila normal (la más alta de sus dos tarjetas)
    const normalRowHeights = [];
    for (let i = 0; i < normalCards.length; i += 2) {
      const left = normalCards[i];
      const right = normalCards[i + 1];
      normalRowHeights.push(Math.max(left.height, right ? right.height : 0));
    }

    // Altura acumulada del grid normal
    const normalGridHeight = normalRowHeights.length
      ? normalRowHeights.reduce((sum, h) => sum + h, 0) + (normalRowHeights.length - 1) * gapY
      : 0;

    // Precalcular la notita con ancho completo
    let noteCard = null;
    if (noteItem) {
      const noteY = normalGridHeight ? startY + normalGridHeight + gapY : startY;
      const lines = wrapText(ctx, noteItem.value, noteCardWidth - 60);
      const neededHeight = lines.length <= 1
        ? baseCardHeight
        : 212 + lines.length * valueLineHeight + 28;
      const height = Math.max(baseCardHeight, neededHeight);
      noteCard = {
        ...noteItem,
        lines,
        height,
        x: startX,
        y: noteY,
        width: noteCardWidth
      };
    }

    // Calcular altura total del canvas según el contenido
    const lastY = noteCard
      ? noteCard.y + noteCard.height
      : startY + normalGridHeight;
    const footerY = lastY + 90;
    const height = footerY + 160;

    canvas.width = width;
    canvas.height = height;

    // Fondo degradado
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#fff0f5');
    bgGradient.addColorStop(0.45, '#f3e5f5');
    bgGradient.addColorStop(1, '#ffe4ec');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Formas decorativas grandes tipo Spotify Wrapped
    drawBlob(ctx, 140, 180, 280, '#ff9ebb', 0.35);
    drawBlob(ctx, 900, 420, 360, '#d4bbff', 0.28);
    drawBlob(ctx, -80, 900, 400, '#ffd8be', 0.30);
    drawBlob(ctx, 1020, height - 290, 320, '#c2f0dc', 0.28);

    // Título principal
    ctx.textAlign = 'center';
    ctx.fillStyle = '#5a4a4f';
    ctx.font = '600 46px Quicksand, sans-serif';
    ctx.fillText('Nuestra cita', width / 2, 130);

    ctx.fillStyle = '#ff7aa2';
    ctx.font = 'bold 96px Quicksand, sans-serif';
    ctx.fillText('¿Salimos? 💕', width / 2, 210);

    ctx.fillStyle = '#8a7a80';
    ctx.font = 'italic 38px Quicksand, sans-serif';
    ctx.fillText('Así quedó todo:', width / 2, 270);

    // Dibujar tarjetas normales
    normalCards.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = startX + col * (normalCardWidth + gapX);
      const y = startY + normalRowHeights.slice(0, row).reduce((sum, h) => sum + h + gapY, 0);
      const cardHeight = item.height;

      // Card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
      ctx.shadowColor = 'rgba(90, 74, 79, 0.08)';
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 14;
      roundRect(ctx, x, y, normalCardWidth, cardHeight, 32);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Emoji grande
      ctx.textAlign = 'left';
      ctx.font = '90px Quicksand, sans-serif';
      ctx.fillText(getEmojiForLabel(item.label), x + 26, y + 110);

      // Label
      ctx.fillStyle = '#8a7a80';
      ctx.font = '600 28px Quicksand, sans-serif';
      ctx.fillText(item.label, x + 26, y + 160);

      // Value con ajuste de líneas
      ctx.fillStyle = '#5a4a4f';
      ctx.font = 'bold 38px Quicksand, sans-serif';
      item.lines.forEach((line, lineIdx) => {
        ctx.fillText(line, x + 26, y + 212 + lineIdx * valueLineHeight);
      });
    });

    // Dibujar notita a ancho completo
    if (noteCard) {
      const { x, y, width: cardW, height: cardH } = noteCard;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
      ctx.shadowColor = 'rgba(90, 74, 79, 0.08)';
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 14;
      roundRect(ctx, x, y, cardW, cardH, 32);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      ctx.textAlign = 'left';
      ctx.font = '90px Quicksand, sans-serif';
      ctx.fillText(getEmojiForLabel(noteCard.label), x + 26, y + 110);

      ctx.fillStyle = '#8a7a80';
      ctx.font = '600 28px Quicksand, sans-serif';
      ctx.fillText(noteCard.label, x + 26, y + 160);

      ctx.fillStyle = '#5a4a4f';
      ctx.font = 'bold 38px Quicksand, sans-serif';
      noteCard.lines.forEach((line, lineIdx) => {
        ctx.fillText(line, x + 26, y + 212 + lineIdx * valueLineHeight);
      });
    }

    // Caja final tipo "wrapped"
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    roundRect(ctx, 110, footerY - 60, width - 220, 160, 30);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff7aa2';
    ctx.font = 'bold 48px Quicksand, sans-serif';
    ctx.fillText('¿Te parece? 😊', width / 2, footerY + 10);

    setTimeout(() => resolve(canvas.toDataURL('image/png')), 150);
  });
}

function getEmojiForLabel(label) {
  const map = {
    '¿Qué se te antoja': '🍽️',
    '¿A qué hora te busco mañana': '🕖',
    '¿Qué onda el plan': '✨',
    '¿Ambiente': '🌿',
    'Notita 💌': '💌'
  };
  for (const key in map) {
    if (label.includes(key)) return map[key];
  }
  return '💕';
}

function drawBlob(ctx, x, y, r, color, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  const points = 8;
  for (let i = 0; i <= points * 2; i++) {
    const angle = (i / (points * 2)) * Math.PI * 2;
    const radius = i % 2 === 0 ? r : r * 0.65;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawDecoration(ctx, x, y, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ═══════════════════════════════════════════════════════════════════
// Confetti
// ═══════════════════════════════════════════════════════════════════

const confettiCanvas = document.getElementById('confetti');
const confettiCtx = confettiCanvas.getContext('2d');
let particles = [];
let animationId = null;

function resizeConfettiCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfettiCanvas);
resizeConfettiCanvas();

function startConfetti() {
  const colors = ['#ff9ebb', '#ff7aa2', '#d4bbff', '#b388ff', '#ffd8be', '#c2f0dc'];
  particles = [];
  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * 10 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltAngle: 0,
      tiltAngleIncremental: Math.random() * 0.07 + 0.05
    });
  }

  if (animationId) cancelAnimationFrame(animationId);
  drawConfetti();
}

function stopConfetti() {
  if (animationId) cancelAnimationFrame(animationId);
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  particles = [];
}

function drawConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  let stillFalling = false;

  particles.forEach((p) => {
    p.tiltAngle += p.tiltAngleIncremental;
    p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
    p.tilt = Math.sin(p.tiltAngle) * 15;

    if (p.y <= confettiCanvas.height) stillFalling = true;

    confettiCtx.beginPath();
    confettiCtx.lineWidth = p.r / 2;
    confettiCtx.strokeStyle = p.color;
    confettiCtx.moveTo(p.x + p.tilt + p.r / 4, p.y);
    confettiCtx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
    confettiCtx.stroke();
  });

  if (stillFalling) {
    animationId = requestAnimationFrame(drawConfetti);
  }
}

// ═══════════════════════════════════════════════════════════════════
// Inicialización
// ═══════════════════════════════════════════════════════════════════

fillConfigForm();
applyConfig();

if (isConfigMode()) {
  activeVersion = getDefaultVersion();
  generateWizard();
  showScreen(configScreen);
} else if (activeVersion) {
  showScreen(inviteScreen);
} else {
  showScreen(landingScreen);
}
