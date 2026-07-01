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

let config = loadConfig() || { ...defaultConfig };
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
const btnEditConfig = document.getElementById('btn-edit-config');
const btnBack = document.getElementById('btn-back');
const btnShareText = document.getElementById('btn-share-text');
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
const btnSaveConfig = document.getElementById('btn-save-config');
const btnDefaultConfig = document.getElementById('btn-default-config');

// ═══════════════════════════════════════════════════════════════════
// Utilidades
// ═══════════════════════════════════════════════════════════════════

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

function parseOptions(text) {
  return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

function parseNoMessages(text) {
  return text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
}

function splitEmojiAndText(option) {
  // Separa el emoji al final del texto (ej: "Pizza 🍕" -> {emoji: "🍕", text: "Pizza"})
  const match = option.match(/^(.*?)\s*([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}])$/u);
  if (match) {
    return { emoji: match[2], text: match[1].trim() };
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

btnSaveConfig.addEventListener('click', () => {
  config = readConfigForm();
  if (config.noMessages.length === 0) config.noMessages = [...defaultConfig.noMessages];
  saveConfig();
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
  const container = inviteScreen.querySelector('.buttons-row');
  const rect = container.getBoundingClientRect();
  const btnRect = btnNo.getBoundingClientRect();

  const padding = 8;
  const maxLeft = rect.width - btnRect.width - padding * 2;
  const maxTop = rect.height - btnRect.height - padding * 2;

  const randomLeft = Math.random() * maxLeft + padding;
  const randomTop = Math.random() * maxTop + padding;

  btnNo.style.position = 'absolute';
  btnNo.style.left = `${randomLeft}px`;
  btnNo.style.top = `${randomTop}px`;

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

btnShareText.addEventListener('click', () => {
  const text = encodeURIComponent(buildShareText());
  window.open(`https://wa.me/?text=${text}`, '_blank');
});

btnShareImage.addEventListener('click', () => {
  drawShareImage().then(dataUrl => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'nuestra-cita.png';
    link.click();
  });
});

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
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#fff5f7');
    gradient.addColorStop(0.5, '#fff0f5');
    gradient.addColorStop(1, '#f3e5f5');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    drawDecoration(ctx, 120, 160, 50, 'rgba(255, 158, 187, 0.25)');
    drawDecoration(ctx, 920, 280, 40, 'rgba(212, 187, 255, 0.25)');
    drawDecoration(ctx, 180, 1700, 60, 'rgba(255, 216, 190, 0.25)');
    drawDecoration(ctx, 900, 1580, 45, 'rgba(194, 240, 220, 0.25)');

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff7aa2';
    ctx.font = 'bold 80px Quicksand, sans-serif';
    ctx.fillText('¡Nuestra cita! 💕', width / 2, 280);

    ctx.fillStyle = '#8a7a80';
    ctx.font = '40px Quicksand, sans-serif';
    ctx.fillText('Así quedó todo:', width / 2, 360);

    const data = getSummaryData();
    const startY = 520;
    const gap = 220;

    data.forEach((item, idx) => {
      const y = startY + idx * gap;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.shadowColor = 'rgba(255, 122, 162, 0.15)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 10;
      roundRect(ctx, 90, y, width - 180, 180, 36);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      ctx.textAlign = 'left';
      ctx.fillStyle = '#ff7aa2';
      ctx.font = 'bold 42px Quicksand, sans-serif';
      ctx.fillText(item.label, 140, y + 70);

      ctx.fillStyle = '#5a4a4f';
      ctx.font = '52px Quicksand, sans-serif';
      const value = item.value.length > 24 ? item.value.slice(0, 22) + '...' : item.value;
      ctx.fillText(value, 140, y + 140);
    });

    const footerY = startY + data.length * gap + 80;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#b388ff';
    ctx.font = 'italic 38px Quicksand, sans-serif';
    ctx.fillText('¿Te parece? 😊', width / 2, footerY);

    setTimeout(() => resolve(canvas.toDataURL('image/png')), 100);
  });
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
  btnEditConfig.style.display = 'flex';
} else {
  showScreen(inviteScreen);
  btnEditConfig.style.display = 'none';
}
