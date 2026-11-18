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
  adminPinHash: '',
  versions: [JSON.parse(JSON.stringify(defaultVersion))]
};

// ── Encriptación de secrets globales ─────────────────────────────
const GLOBAL_PASSWORD = 'Laniakea$31415$';
const GLOBAL_SALT = new Uint8Array([0x4c, 0x61, 0x6e, 0x69, 0x61, 0x6b, 0x65, 0x61, 0x33, 0x31, 0x34, 0x31, 0x35, 0x5f, 0x53, 0x31]);

async function deriveGlobalKey() {
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(GLOBAL_PASSWORD), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: GLOBAL_SALT, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptSecret(plaintext) {
  if (!plaintext) return '';
  try {
    const key = await deriveGlobalKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext)
    );
    const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);
    return btoa(String.fromCharCode(...combined));
  } catch (e) {
    console.warn('crypto.subtle no disponible, usando fallback:', e);
    return btoa(unescape(encodeURIComponent(plaintext)));
  }
}

async function decryptSecret(encoded) {
  if (!encoded) return '';
  try {
    const key = await deriveGlobalKey();
    const combined = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv }, key, ciphertext
    );
    return new TextDecoder().decode(plaintext);
  } catch (e) {
    // Fallback: intentar decode simple (datos guardados con el fallback)
    try {
      return decodeURIComponent(escape(atob(encoded)));
    } catch (e2) {
      return '';
    }
  }
}

const MAX_TEXT = {
  versionId: 50,
  name: 80,
  inviteTitle: 160,
  inviteSubtitle: 240,
  notePlaceholder: 120,
  noMessage: 80,
  stepTitle: 120,
  stepSubtitle: 160,
  option: 100
};

const ALLOWED_GRID_CLASSES = ['options-grid', 'options-grid-three', 'options-stack'];

function normalizePinHash(value) {
  return /^[a-f0-9]{16,128}$/i.test(String(value || '')) ? String(value).toLowerCase() : '';
}

function migrateConfig(input) {
  if (!input) return JSON.parse(JSON.stringify(defaultConfig));

  // Preservar config global encriptada si existe
  const global = input.global && typeof input.global === 'object' ? {
    telegramBotTokenEnc: String(input.global.telegramBotTokenEnc || ''),
    telegramChatIdEnc: String(input.global.telegramChatIdEnc || '')
  } : {};

  // Tokens legacy en plaintext: marcar para que initGlobalSettings los encrypte
  const legacyBotToken = input.telegramBotToken || '';
  const legacyChatId = input.telegramChatId || '';

  // Migrar secrets viejos a localStorage (respaldo temporal)
  if (legacyBotToken || legacyChatId) {
    const creds = loadTelegramCreds();
    saveTelegramCreds(
      creds.botToken || legacyBotToken,
      creds.chatId || legacyChatId
    );
  }

  // Si ya tiene versions, está en el nuevo formato
  if (Array.isArray(input.versions) && input.versions.length > 0) {
    return {
      adminPinHash: normalizePinHash(input.adminPinHash),
      versions: input.versions.map(v => sanitizeVersion({ ...defaultVersion, ...v })),
      global,
      ...(legacyBotToken ? { _legacyTelegramBotToken: legacyBotToken } : {}),
      ...(legacyChatId ? { _legacyTelegramChatId: legacyChatId } : {})
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
    adminPinHash: normalizePinHash(input.adminPinHash),
    versions: [sanitizeVersion(legacyVersion)],
    global,
    ...(legacyBotToken ? { _legacyTelegramBotToken: legacyBotToken } : {}),
    ...(legacyChatId ? { _legacyTelegramChatId: legacyChatId } : {})
  };
}

// ── URL sanitization ──────────────────────────────────────────────
// Strip all params except v and config. Validate their values.
(function sanitizeURL() {
  const url = new URL(window.location.href);
  const allowed = new Set(['v', 'config']);
  let dirty = false;

  // Remove unknown params
  for (const key of [...url.searchParams.keys()]) {
    if (!allowed.has(key)) {
      url.searchParams.delete(key);
      dirty = true;
    }
  }

  // Validate v: alphanumeric, hyphens, underscores only (max 50 chars)
  const v = url.searchParams.get('v');
  if (v !== null) {
    if (!/^[a-zA-Z0-9_-]{1,50}$/.test(v)) {
      url.searchParams.delete('v');
      dirty = true;
    }
  }

  // Validate config: must be exactly "1" or absent
  const cfg = url.searchParams.get('config');
  if (cfg !== null && cfg !== '1') {
    url.searchParams.delete('config');
    dirty = true;
  }

  if (dirty) {
    window.history.replaceState({}, '', url.toString());
  }
})();

let config = migrateConfig(loadConfig() || loadSavedConfig() || { ...defaultConfig });
let activeVersion = getActiveVersion();
let selections = {};
((activeVersion || getDefaultVersion()).steps || []).forEach(step => selections[step.key] = null);
let currentStep = 0;
let noMessageIndex = 0;
let editingVersionIndex = 0;

function hasVersionParam() {
  const params = new URLSearchParams(window.location.search);
  return !!params.get('v');
}

function getActiveVersion() {
  const params = new URLSearchParams(window.location.search);
  const versionId = params.get('v');

  // Si no se especifica versión, no se muestra ningún formulario
  if (!versionId) return null;

  if (config.versions) {
    const found = config.versions.find(v => v.id === versionId);
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
  // config.js puede exportar savedConfig; se usa como fallback si no hay nada en localStorage
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
    localStorage.setItem('dateConfigLastSaved', String(Date.now()));
    return true;
  } catch (e) {
    console.error('Error guardando en localStorage:', e);
    return false;
  }
}

function renderLastSaved() {
  const el = document.getElementById('last-saved-indicator');
  if (!el) return;
  try {
    const ts = localStorage.getItem('dateConfigLastSaved');
    el.textContent = ts ? 'Último guardado: ' + formatDate(parseInt(ts, 10)) : '';
  } catch (e) {
    el.textContent = '';
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

// Secrets de Telegram: solo en este navegador, nunca en config.js ni en git.
function loadTelegramCreds() {
  try {
    return {
      botToken: localStorage.getItem('dateTelegramBotToken') || '',
      chatId: localStorage.getItem('dateTelegramChatId') || ''
    };
  } catch (e) {
    return { botToken: '', chatId: '' };
  }
}

function saveTelegramCreds(botToken, chatId) {
  try {
    if (botToken) {
      localStorage.setItem('dateTelegramBotToken', botToken);
    } else {
      localStorage.removeItem('dateTelegramBotToken');
    }
    if (chatId) {
      localStorage.setItem('dateTelegramChatId', chatId);
    } else {
      localStorage.removeItem('dateTelegramChatId');
    }
  } catch (e) {
    // ignorar
  }
}

// Inicializar config global: decrypt config.global → localStorage, migrar legacy
async function initGlobalSettings() {
  if (!config.global) config.global = {};

  // Migrar tokens legacy en plaintext → encriptar en config.global
  if (config._legacyTelegramBotToken || config._legacyTelegramChatId) {
    const encToken = await encryptSecret(config._legacyTelegramBotToken || '');
    const encChat = await encryptSecret(config._legacyTelegramChatId || '');
    if (encToken) config.global.telegramBotTokenEnc = encToken;
    if (encChat) config.global.telegramChatIdEnc = encChat;
    delete config._legacyTelegramBotToken;
    delete config._legacyTelegramChatId;
    saveConfig();
  }

  // Decrypt config.global → cachear en localStorage
  if (config.global.telegramBotTokenEnc || config.global.telegramChatIdEnc) {
    const botToken = await decryptSecret(config.global.telegramBotTokenEnc || '');
    const chatId = await decryptSecret(config.global.telegramChatIdEnc || '');
    if (botToken || chatId) {
      saveTelegramCreds(botToken, chatId);
    }
  }
}

function clampText(value, max) {
  return String(value == null ? '' : value).slice(0, max);
}

function normalizeVersionId(value) {
  const id = clampText(value, MAX_TEXT.versionId);
  return /^[a-zA-Z0-9_-]{1,50}$/.test(id) ? id : '';
}

function normalizeStepKey(value) {
  const key = clampText(value, 40);
  return /^[a-z0-9_-]{1,40}$/.test(key) ? key : `step_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeGridClass(value) {
  return ALLOWED_GRID_CLASSES.indexOf(value) >= 0 ? value : 'options-grid';
}

function sanitizeVersion(raw) {
  const steps = (Array.isArray(raw.steps) ? raw.steps : [])
    .slice(0, 12)
    .map((step, idx) => ({
      key: normalizeStepKey(step && step.key) || `step_${idx + 1}`,
      emoji: clampText(step && step.emoji, 16) || '✨',
      title: clampText(step && step.title, MAX_TEXT.stepTitle),
      subtitle: clampText(step && step.subtitle, MAX_TEXT.stepSubtitle),
      gridClass: normalizeGridClass(step && step.gridClass),
      options: (Array.isArray(step && step.options) ? step.options : [])
        .slice(0, 12)
        .map(opt => clampText(opt, MAX_TEXT.option))
        .filter(opt => opt.trim().length > 0)
    }))
    .filter(step => step.title.trim().length > 0);

  return {
    id: normalizeVersionId(raw && raw.id) || `v${Date.now().toString(36)}`,
    name: clampText(raw && raw.name, MAX_TEXT.name) || 'Sin nombre',
    inviteTitle: clampText(raw && raw.inviteTitle, MAX_TEXT.inviteTitle) || defaultVersion.inviteTitle,
    inviteSubtitle: clampText(raw && raw.inviteSubtitle, MAX_TEXT.inviteSubtitle) || defaultVersion.inviteSubtitle,
    notePlaceholder: clampText(raw && raw.notePlaceholder, MAX_TEXT.notePlaceholder) || defaultVersion.notePlaceholder,
    noMessages: (Array.isArray(raw && raw.noMessages) ? raw.noMessages : [])
      .slice(0, 20)
      .map(msg => clampText(msg, MAX_TEXT.noMessage))
      .filter(msg => msg.trim().length > 0),
    steps: steps.length ? steps : JSON.parse(JSON.stringify(defaultVersion.steps))
  };
}

function buildConfigJsContent() {
  const configObject = {
    adminPinHash: normalizePinHash(config.adminPinHash),
    versions: (config.versions || []).map(sanitizeVersion)
  };

  // Incluir config global encriptada si existe
  if (config.global && (config.global.telegramBotTokenEnc || config.global.telegramChatIdEnc)) {
    configObject.global = {
      telegramBotTokenEnc: config.global.telegramBotTokenEnc || '',
      telegramChatIdEnc: config.global.telegramChatIdEnc || ''
    };
  }

  return `// Configuración guardada del sitio.\n// Se actualiza automáticamente desde la web y se sincroniza por GitHub.\n// Secrets encriptados con AES-GCM — el texto plano nunca se sube a git.\nconst savedConfig = ${JSON.stringify(configObject, null, 2)};\n`;
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
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

// EMOJI_LIST is loaded from emojis.js (generated by generate-emoji-data.mjs)

// Popular emojis shown by default (no search). Subset kept small for fast render.
const POPULAR_EMOJIS = [
  // Caras y emociones
  '😀','😂','🥰','😍','😊','😎','🥺','😢','😭','😤','🤔','😏','😘','🤗','🥳','🤩','😇','😈','🙄','😴',
  '😌','😬','🙃','😱','🤩','😝','😜','🤪','😇','🤗','🤭','🤫','🤥','😶','😐','😑','😯','😦','😧','😮',
  '😲','🥱','😴','🤤','😪','😮‍💨','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','😮','😯',
  // Corazones y amor
  '❤️','💖','💕','💗','💘','💝','🖤','💔','💛','💚','💙','💜','🤍','🤎','🧡','🫶','💋','💌','💐','🌹',
  '💍','🥰','😍','😘','😻','💑','💏','🫂','❣️','💞','💓','💟','❤️‍🔥','❤️‍🩹','💋','🩷','🩵',
  // Fiesta y celebración
  '🎉','🎊','🎁','🎈','🎶','🎵','🎸','🎤','🎧','🎬','🎭','🎪','🎨','🎮','🕹️','🧩','🎲','🏆','🥇','⚽',
  '🎂','🍰','🥂','🍾','🍻','🎯','🎳','🎰','🪅','🪩','🎈','🎀','🪄','✨','🌟','💫','⭐','🎇','🎆','🕯️',
  // Comida y bebida
  '🍕','🍔','🍟','🌮','🍣','🍜','🍝','🍰','🍩','🍪','🍫','🍦','☕','🍵','🍷','🍺','🥂','🧋','🧃','🧉',
  '🥐','🥪','🥗','🍝','🍖','🍗','🥩','🍤','🦞','🦀','🦑','🐙','🦐','🍦','🧁','🍮','🍬','🍭','🍯','🧂',
  // Animales y naturaleza
  '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦋','🌸',
  '🌺','🌻','🌷','🌹','🍀','🌿','🌵','🌴','🌳','🍁','🍂','🌙','⭐','✨','🔥','🌈','☀️','🌤️','🌊','❄️',
  '🦄','🐝','🐞','🕷️','🐢','🐍','🦎','🐙','🐠','🐟','🐬','🐳','🦈','🐊','🦩','🦚','🦜','🕊️','🦅','🦉',
  // Viajes y lugares
  '🚗','✈️','🚀','🛸','🚁','🚂','⛵','🏠','🏢','🏰','🗼','🗽','⛩️','🎡','🎢','🏖️','🏔️','🌋','🌍','🌎',
  '🗺️','🧭','🏕️','🏖️','🏜️','🏝️','🏞️','🏟️','🏛️','🕌','🛕','⛪','🕍','⛩️','🗻','🏔️','🌋','⛰️','🌄','🌅',
  // Objetos y símbolos
  '📱','💻','⌚','📷','🎥','📺','💡','🔋','🔑','📝','📌','📎','✂️','🛒','💰','💎','🧪','🔬','🔭','📡',
  '🔥','💧','⚡','🌪️','🌊','🍀','🌈','☀️','🌙','🪐','🌍','⭐','✨','💤','💢','💥','💦','💨','🕳️','💣',
  // Manos y gestos
  '👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️',
  '👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','🤝','👐','🤲','🫱','🫲','🫳','🫴','🙏','💪','🦾','🫵',
  // Extra útiles
  '✅','❌','⚠️','❓','❗','💯','🔄','⏭️','⏮️','⏸️','▶️','⏹️','⏺️','📸','🗓️','📅','⏰','🔔','🔕','📣'
];

function createEmojiPicker(currentEmoji, onSelect) {
  const picker = document.createElement('div');
  picker.className = 'emoji-picker';

  const search = document.createElement('input');
  search.type = 'search';
  search.className = 'emoji-picker-search';
  search.placeholder = 'Buscar emoji...';
  search.autocomplete = 'off';

  function renderButtons(filter = '') {
    const term = filter.toLowerCase().trim();
    picker.querySelectorAll('button.emoji-btn').forEach(b => b.remove());

    if (!term) {
      // Show popular emojis by default for fast render
      POPULAR_EMOJIS.forEach(emoji => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'emoji-btn';
        btn.textContent = emoji;
        btn.title = emoji;
        if (emoji === currentEmoji) btn.classList.add('selected');
        btn.addEventListener('click', () => onSelect(emoji));
        picker.appendChild(btn);
      });
      return;
    }

    // Search: filter all emojis, cap at 300 for performance
    let count = 0;
    const MAX_RESULTS = 300;
    for (const item of EMOJI_LIST) {
      if (!item.name.includes(term) && !(item.keywords && item.keywords.includes(term))) continue;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'emoji-btn';
      btn.textContent = item.emoji;
      btn.title = item.name;
      if (item.emoji === currentEmoji) btn.classList.add('selected');
      btn.addEventListener('click', () => onSelect(item.emoji));
      picker.appendChild(btn);
      if (++count >= MAX_RESULTS) break;
    }
  }

  search.addEventListener('input', () => renderButtons(search.value));

  picker.appendChild(search);
  renderButtons();

  // Focus en el buscador al abrir
  setTimeout(() => search.focus(), 0);

  return picker;
}

function createOptionInput(value) {
  const parts = splitEmojiAndText(value || '');
  const row = document.createElement('div');
  row.className = 'step-editor-option';

  const emojiBtn = document.createElement('button');
  emojiBtn.type = 'button';
  emojiBtn.className = 'step-editor-option-emoji';
  emojiBtn.textContent = parts.emoji;
  emojiBtn.title = 'Cambiar emoji';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Opción';
  input.value = parts.text;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn-remove-option';
  removeBtn.textContent = '×';
  removeBtn.title = 'Eliminar opción';
  removeBtn.addEventListener('click', () => row.remove());

  const pickerContainer = document.createElement('div');
  pickerContainer.className = 'emoji-picker-container';

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

  row.appendChild(emojiBtn);
  row.appendChild(input);
  row.appendChild(removeBtn);
  row.appendChild(pickerContainer);
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

    const title = clampText(titleEl ? titleEl.value.trim() : '', MAX_TEXT.stepTitle);
    if (!title) return;

    const options = [];
    child.querySelectorAll('.step-editor-option').forEach(optRow => {
      const emojiEl = optRow.querySelector('.step-editor-option-emoji');
      const textEl = optRow.querySelector('input');
      const text = clampText(textEl ? textEl.value.trim() : '', MAX_TEXT.option);
      if (!text) return;
      const emoji = clampText(emojiEl ? emojiEl.textContent.trim() : '✨', 16) || '✨';
      options.push(`${text} ${emoji}`.trim());
    });

    steps.push({
      key: normalizeStepKey(child.dataset.key),
      emoji: clampText(emojiEl ? emojiEl.textContent.trim() : '✨', 16) || '✨',
      title,
      subtitle: clampText(subtitleEl ? subtitleEl.value.trim() : '', MAX_TEXT.stepSubtitle),
      gridClass: normalizeGridClass(gridClassEl ? gridClassEl.value : 'options-grid'),
      options: options.length ? options.slice(0, 12) : ['']
    });
  });
  return steps;
}

function fillConfigForm() {
  const version = config.versions[editingVersionIndex] || config.versions[0];
  const creds = loadTelegramCreds();

  cfgInviteTitle.value = version.inviteTitle;
  cfgInviteSubtitle.value = version.inviteSubtitle;
  cfgNotePlaceholder.value = version.notePlaceholder;
  cfgNoMessages.value = version.noMessages.join('\n');
  cfgTelegramBotToken.value = creds.botToken;
  cfgTelegramChatId.value = creds.chatId;
  cfgVersionId.value = version.id;
  cfgVersionName.value = version.name;
  cfgGitHubToken.value = loadGitHubToken() || '';

  updateVersionSelector();
  renderStepsEditor();
  renderLastSaved();
}

function readConfigForm() {
  const version = config.versions[editingVersionIndex] || config.versions[0];

  version.id = normalizeVersionId(cfgVersionId.value.trim()) || version.id;
  version.name = clampText(cfgVersionName.value.trim() || version.name, MAX_TEXT.name);
  version.inviteTitle = clampText(cfgInviteTitle.value.trim(), MAX_TEXT.inviteTitle) || defaultVersion.inviteTitle;
  version.inviteSubtitle = clampText(cfgInviteSubtitle.value.trim(), MAX_TEXT.inviteSubtitle) || defaultVersion.inviteSubtitle;
  version.notePlaceholder = clampText(cfgNotePlaceholder.value.trim(), MAX_TEXT.notePlaceholder) || defaultVersion.notePlaceholder;
  version.noMessages = parseNoMessages(cfgNoMessages.value)
    .slice(0, 20)
    .map(msg => clampText(msg, MAX_TEXT.noMessage))
    .filter(msg => msg.trim().length > 0);
  version.steps = readStepsFromEditor();

  return {
    adminPinHash: normalizePinHash(config.adminPinHash),
    versions: config.versions.map(sanitizeVersion),
    global: config.global || {},
    // Temporales: el save handler los encrypta y pone en config.global
    _newTelegramBotToken: cfgTelegramBotToken.value.trim(),
    _newTelegramChatId: cfgTelegramChatId.value.trim()
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

// ── PIN del editor de config ──────────────────────────────────────
async function hashPin(pin) {
  const raw = String(pin || '');
  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    const data = new TextEncoder().encode(raw);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback débil solo si el navegador no tiene WebCrypto
  let h = 5381;
  for (let i = 0; i < raw.length; i++) {
    h = ((h << 5) + h + raw.charCodeAt(i)) | 0;
  }
  return ('00000000' + (h >>> 0).toString(16)).slice(-8) + raw.length.toString(16);
}

function isConfigUnlocked() {
  try {
    return sessionStorage.getItem('dateConfigUnlocked') === '1';
  } catch (e) {
    return false;
  }
}

function unlockConfigSession() {
  try {
    sessionStorage.setItem('dateConfigUnlocked', '1');
  } catch (e) {
    // ignorar
  }
}

// ── Gate de config global (password) ─────────────────────────────
function isGlobalUnlocked() {
  try {
    return sessionStorage.getItem('dateGlobalUnlocked') === '1';
  } catch (e) {
    return false;
  }
}

function unlockGlobalSession() {
  try {
    sessionStorage.setItem('dateGlobalUnlocked', '1');
  } catch (e) {
    // ignorar
  }
}

function showGlobalPanel() {
  const gate = document.getElementById('global-gate');
  const panel = document.getElementById('global-panel');
  if (gate) gate.classList.add('is-hidden');
  if (panel) panel.classList.remove('is-hidden');
}

function showGlobalGate() {
  const gate = document.getElementById('global-gate');
  const panel = document.getElementById('global-panel');
  if (panel) panel.classList.add('is-hidden');
  if (gate) gate.classList.remove('is-hidden');
}

async function handleGlobalPasswordSubmit() {
  const input = document.getElementById('global-password-input');
  const pin = input ? input.value : '';
  if (!pin) {
    alert('Ingresá la contraseña.');
    return;
  }
  const attempt = await hashPin(pin);
  const expected = await hashPin(GLOBAL_PASSWORD);
  if (attempt !== expected) {
    alert('Contraseña incorrecta.');
    return;
  }
  if (input) input.value = '';
  unlockGlobalSession();
  showGlobalPanel();
  // Popular campos con los creds actuales
  const creds = loadTelegramCreds();
  const tokenEl = document.getElementById('cfg-telegram-bot-token');
  const chatEl = document.getElementById('cfg-telegram-chat-id');
  if (tokenEl) tokenEl.value = creds.botToken;
  if (chatEl) chatEl.value = creds.chatId;
}

function showConfigPanel() {
  const gate = document.getElementById('config-gate');
  const panel = document.getElementById('config-panel');
  if (gate) gate.classList.add('is-hidden');
  if (panel) panel.classList.remove('is-hidden');
}

function showConfigGate() {
  const gate = document.getElementById('config-gate');
  const panel = document.getElementById('config-panel');
  const hint = document.getElementById('config-gate-hint');
  const confirmInput = document.getElementById('config-pin-confirm');
  const hasPin = !!normalizePinHash(config.adminPinHash);

  if (panel) panel.classList.add('is-hidden');
  if (gate) gate.classList.remove('is-hidden');

  if (hint) {
    hint.textContent = hasPin
      ? 'Entrá el PIN para editar la config.'
      : 'Primera vez: creá un PIN para proteger este panel.';
  }
  if (confirmInput) {
    confirmInput.classList.toggle('is-hidden', hasPin);
  }
}

async function handleConfigPinSubmit() {
  const pinInput = document.getElementById('config-pin-input');
  const confirmInput = document.getElementById('config-pin-confirm');
  const pin = pinInput ? pinInput.value : '';

  if (!pin || pin.length < 4) {
    alert('El PIN necesita al menos 4 caracteres.');
    return;
  }

  const hasPin = !!normalizePinHash(config.adminPinHash);

  if (!hasPin) {
    const confirm = confirmInput ? confirmInput.value : '';
    if (pin !== confirm) {
      alert('Los PIN no coinciden.');
      return;
    }
    config.adminPinHash = await hashPin(pin);
    saveConfig();
  } else {
    const attempt = await hashPin(pin);
    if (attempt !== config.adminPinHash) {
      alert('PIN incorrecto.');
      return;
    }
  }

  if (pinInput) pinInput.value = '';
  if (confirmInput) confirmInput.value = '';
  unlockConfigSession();
  showConfigPanel();
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

  // Encryptar telegram creds y guardar en config.global + localStorage
  const rawToken = config._newTelegramBotToken || '';
  const rawChatId = config._newTelegramChatId || '';
  delete config._newTelegramBotToken;
  delete config._newTelegramChatId;
  if (!config.global) config.global = {};

  if (rawToken || rawChatId) {
    config.global.telegramBotTokenEnc = await encryptSecret(rawToken);
    config.global.telegramChatIdEnc = await encryptSecret(rawChatId);
    saveTelegramCreds(rawToken, rawChatId);
  }

  const token = cfgGitHubToken.value.trim();
  saveGitHubToken(token);
  const localOk = saveConfig();

  let msg = localOk
    ? 'Configuración guardada en este navegador ✓'
    : '⚠ No se pudo guardar en este navegador (localStorage). La config puede perderse al cerrar la pestaña.';

  if (token) {
    try {
      await uploadConfigToGitHub(token);
      msg += '\n\nSincronizada en GitHub ✓';
    } catch (err) {
      console.error('Error subiendo a GitHub:', err);
      exportConfigFile();
      msg += '\n\n⚠ No se pudo subir a GitHub: ' + err.message +
        '\nSe descargó config.js — reemplazalo en el repo y hacé push para tenerlo en la nube.';
    }
  } else {
    exportConfigFile();
    msg += '\n\nSe descargó config.js. Subilo a GitHub (o usá push.bat) para que esté disponible en otros dispositivos.';
  }

  alert(msg);

  renderLastSaved();

  // Redirigir a ?v=<id> de la versión editada para que la URL sea correcta
  const editedVersion = config.versions[editingVersionIndex] || config.versions[0];
  const vid = editedVersion && editedVersion.id ? editedVersion.id : '';
  exitConfigMode();
  if (vid) {
    const url = new URL(window.location.href);
    url.searchParams.set('v', vid);
    window.history.replaceState({}, '', url.toString());
  }
  // Resetear el wizard y regenerarlo con la versión correcta
  currentStep = 0;
  noMessageIndex = 0;
  selections = {};
  activeVersion = getActiveVersion();
  if (activeVersion) {
    (activeVersion.steps || []).forEach(step => selections[step.key] = null);
    inviteTitle.textContent = renderTemplate(activeVersion.inviteTitle, activeVersion);
    inviteSubtitle.textContent = renderTemplate(activeVersion.inviteSubtitle, activeVersion);
    generateWizard();
    showScreen(inviteScreen);
  } else {
    showScreen(landingScreen);
  }
});

btnDefaultConfig.addEventListener('click', () => {
  const pinHash = normalizePinHash(config.adminPinHash);
  config = JSON.parse(JSON.stringify(defaultConfig));
  config.adminPinHash = pinHash;
  editingVersionIndex = 0;
  fillConfigForm();
});

(function bindConfigPin() {
  const btn = document.getElementById('btn-config-pin');
  const pinInput = document.getElementById('config-pin-input');
  const confirmInput = document.getElementById('config-pin-confirm');

  if (btn) btn.addEventListener('click', handleConfigPinSubmit);
  [pinInput, confirmInput].forEach(input => {
    if (!input) return;
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfigPinSubmit();
      }
    });
  });
})();

(function bindGlobalGate() {
  const btn = document.getElementById('btn-global-password');
  const input = document.getElementById('global-password-input');

  if (btn) btn.addEventListener('click', handleGlobalPasswordSubmit);
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleGlobalPasswordSubmit();
      }
    });
  }
})();

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
          <span class="opt-emoji">${escapeHtml(parts.emoji)}</span>
          <span>${escapeHtml(parts.text)}</span>
        </button>
      `;
    });

    stepDiv.innerHTML = `
      <div class="step-emoji">${escapeHtml(step.emoji)}</div>
      <h2>${escapeHtml(step.title)}</h2>
      <p class="subtitle">${escapeHtml(step.subtitle)}</p>
      <div class="options-stack ${escapeHtml(normalizeGridClass(step.gridClass))}" data-name="${escapeHtml(normalizeStepKey(step.key))}">
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
    const safeName = (typeof CSS !== 'undefined' && CSS.escape) ? CSS.escape(name) : String(name).replace(/"/g, '\\"');
    const group = document.querySelector(`.options-stack[data-name="${safeName}"]`);
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
  const creds = loadTelegramCreds();
  const token = creds.botToken;
  const chatId = creds.chatId;
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

  // Texto plano: sin parse_mode para evitar inyección de Markdown con contenido del usuario
  const message = `💕 Nueva respuesta 💕\n\n` +
    `Versión: ${activeVersion.name}\n` +
    `Fecha: ${formatDate(new Date())}\n\n` +
    `${details}` +
    (note ? `\n💌 Notita: ${note}` : '');

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
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

// Decrypt config.global → localStorage (async, no bloquea la UI)
initGlobalSettings().then(() => {
  fillConfigForm();
});

fillConfigForm();
applyConfig();

if (isConfigMode()) {
  activeVersion = getDefaultVersion();
  generateWizard();
  showScreen(configScreen);
  if (isConfigUnlocked()) {
    showConfigPanel();
  } else {
    showConfigGate();
  }
  // Gate de config global
  if (isGlobalUnlocked()) {
    showGlobalPanel();
  } else {
    showGlobalGate();
  }
} else if (activeVersion) {
  showScreen(inviteScreen);
} else {
  showScreen(landingScreen);
}
