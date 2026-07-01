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

const defaultConfig = {
  inviteTitle: '¿Quieres salir conmigo?',
  inviteSubtitle: 'Tengo ganas de verte y quiero que coordinemos todo juntos.',
  food: ['Pizza 🍕', 'Hamburguesas 🍔', 'Al plato 🍽️', 'Lo que sea mientras sea contigo ✨'],
  time: ['19:00 🕖', '20:00 🕗', '20:30 🕣', 'Nos encontramos allí 🚶'],
  plan: ['Cenar 🍷', 'Tomar algo 🧉', 'Pasear 🌙', 'Sorpresa 🎁'],
  vibe: ['Tranqui 🌿', 'Animado 🎉', 'Íntimo 🕯️'],
  notePlaceholder: 'Ej: me muero de ganas de verte ✨',
  noMessages: ['No 💔', '¿Segura?', '¿Segurísima? 🥺', '¿Cómo que no? 😏', 'Pensalo bien 💭']
};

const stepConfig = [
  { key: 'food', emoji: '🍽️', title: '¿Qué se te antoja?', subtitle: 'Elige lo que más te provoque', gridClass: 'options-grid' },
  { key: 'time', emoji: '🕖', title: '¿A qué hora te busco mañana?', subtitle: 'O si preferís encontrarnos', gridClass: 'options-grid' },
  { key: 'plan', emoji: '✨', title: '¿Qué onda el plan?', subtitle: 'Contame qué te pinta', gridClass: 'options-grid' },
  { key: 'vibe', emoji: '🌿', title: '¿Ambiente?', subtitle: 'Elige la onda de la salida', gridClass: 'options-grid-three' }
];

let config = loadSavedConfig() || loadConfig() || { ...defaultConfig };
let selections = {};
stepConfig.forEach(step => selections[step.key] = null);
let currentStep = 0;
let noMessageIndex = 0;

// Referencias DOM
const configScreen = document.getElementById('config-screen');
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
const cfgFood = document.getElementById('cfg-food');
const cfgTime = document.getElementById('cfg-time');
const cfgPlan = document.getElementById('cfg-plan');
const cfgVibe = document.getElementById('cfg-vibe');
const cfgNotePlaceholder = document.getElementById('cfg-note-placeholder');
const cfgNoMessages = document.getElementById('cfg-no-messages');
const cfgGitHubToken = document.getElementById('cfg-github-token');
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
    inviteTitle: config.inviteTitle,
    inviteSubtitle: config.inviteSubtitle,
    food: config.food,
    time: config.time,
    plan: config.plan,
    vibe: config.vibe,
    notePlaceholder: config.notePlaceholder,
    noMessages: config.noMessages
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

function fillConfigForm() {
  cfgInviteTitle.value = config.inviteTitle;
  cfgInviteSubtitle.value = config.inviteSubtitle;
  cfgFood.value = config.food.join(', ');
  cfgTime.value = config.time.join(', ');
  cfgPlan.value = config.plan.join(', ');
  cfgVibe.value = config.vibe.join(', ');
  cfgNotePlaceholder.value = config.notePlaceholder;
  cfgNoMessages.value = config.noMessages.join('\n');
  cfgGitHubToken.value = loadGitHubToken() || '';
}

function readConfigForm() {
  return {
    inviteTitle: cfgInviteTitle.value.trim() || defaultConfig.inviteTitle,
    inviteSubtitle: cfgInviteSubtitle.value.trim() || defaultConfig.inviteSubtitle,
    food: parseOptions(cfgFood.value),
    time: parseOptions(cfgTime.value),
    plan: parseOptions(cfgPlan.value),
    vibe: parseOptions(cfgVibe.value),
    notePlaceholder: cfgNotePlaceholder.value.trim() || defaultConfig.notePlaceholder,
    noMessages: parseNoMessages(cfgNoMessages.value)
  };
}

function applyConfig() {
  inviteTitle.textContent = config.inviteTitle;
  inviteSubtitle.textContent = config.inviteSubtitle;
  generateWizard();
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
  if (config.noMessages.length === 0) config.noMessages = [...defaultConfig.noMessages];

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
  config = { ...defaultConfig };
  fillConfigForm();
});



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
  if (noMessageIndex === 0) {
    btnNo.textContent = config.noMessages[0] || 'No 💔';
    noMessageIndex = 1;
  } else {
    const messages = config.noMessages.slice(1);
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
  currentStep = 0;
  stepConfig.forEach(step => selections[step.key] = null);
  updateWizard();
  showScreen(detailsScreen);
});

// ═══════════════════════════════════════════════════════════════════
// Wizard dinámico
// ═══════════════════════════════════════════════════════════════════

function generateWizard() {
  const stepsContainer = document.getElementById('wizard-steps');
  const dotsContainer = document.getElementById('progress-dots');

  stepsContainer.innerHTML = '';
  dotsContainer.innerHTML = '';

  stepConfig.forEach((step, idx) => {
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
    const isWideLast = isGridThree && config[step.key].length % 2 === 1;

    let optionsHtml = '';
    config[step.key].forEach((opt, optIdx) => {
      const parts = splitEmojiAndText(opt);
      const wideClass = isWideLast && optIdx === config[step.key].length - 1 ? ' option-wide' : '';
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
  noteStep.dataset.step = stepConfig.length;
  noteStep.innerHTML = `
    <div class="step-emoji">💌</div>
    <h2>Una notita para mí</h2>
    <p class="subtitle">Opcional, pero me encantaría leerte</p>
    <textarea id="note" rows="4" placeholder="${escapeHtml(config.notePlaceholder)}"></textarea>
    <button id="btn-summary" class="btn btn-primary">Ver resumen 💕</button>
  `;
  stepsContainer.appendChild(noteStep);

  const noteDot = document.createElement('span');
  noteDot.className = 'dot';
  noteDot.dataset.step = stepConfig.length;
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
  });
}

function updateWizard() {
  document.querySelectorAll('.step').forEach((step, idx) => {
    step.classList.toggle('active', idx === currentStep);
  });
  document.querySelectorAll('.dot').forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentStep);
  });
  btnBack.classList.toggle('hidden', currentStep === 0);

  const name = stepConfig[currentStep]?.key;
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
  if (currentStep < stepConfig.length) {
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
  stepConfig.forEach(step => {
    if (selections[step.key]) {
      data.push({ label: step.title.replace('?', ''), value: selections[step.key] });
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
  stepConfig.forEach(step => selections[step.key] = null);
  noMessageIndex = 0;
  stopConfetti();
  showScreen(inviteScreen);
});

// ═══════════════════════════════════════════════════════════════════
// Generar imagen del resumen
// ═══════════════════════════════════════════════════════════════════

function drawShareImage() {
  return new Promise((resolve) => {
    const canvas = shareCanvas;
    const ctx = canvas.getContext('2d');
    const width = 1080;
    const height = 1440;
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
    drawBlob(ctx, 1020, 1150, 320, '#c2f0dc', 0.28);

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

    const data = getSummaryData();
    const cardWidth = 460;
    const cardHeight = 240;
    const gapX = 30;
    const gapY = 30;
    const startX = (width - (cardWidth * 2 + gapX)) / 2;
    const startY = 330;

    data.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = startX + col * (cardWidth + gapX);
      const y = startY + row * (cardHeight + gapY);

      // Card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
      ctx.shadowColor = 'rgba(90, 74, 79, 0.08)';
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 14;
      roundRect(ctx, x, y, cardWidth, cardHeight, 32);
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

      // Value
      ctx.fillStyle = '#5a4a4f';
      ctx.font = 'bold 38px Quicksand, sans-serif';
      const value = item.value.length > 16 ? item.value.slice(0, 14) + '...' : item.value;
      ctx.fillText(value, x + 26, y + 212);
    });

    const lastY = startY + Math.ceil(data.length / 2) * (cardHeight + gapY);
    const footerY = lastY + 90;

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
  showScreen(configScreen);
} else {
  showScreen(inviteScreen);
}
