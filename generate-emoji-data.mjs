/**
 * Generate emoji data from Unicode CLDR annotations (English + Spanish).
 * Run once: node generate-emoji-data.mjs
 * Output: emojis.js
 */
import { writeFileSync } from 'fs';

const BASE_URL = 'https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json';

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

function extractNames(data) {
  const result = {};
  // Soporta ambos formatos: annotations.annotations y annotationsDerived.annotations
  const ann = data?.annotations?.annotations || data?.annotationsDerived?.annotations;
  if (!ann) return result;
  for (const [code, value] of Object.entries(ann)) {
    if (typeof value === 'object' && value.tts) {
      result[code] = value.tts[0] || '';
    } else if (typeof value === 'string') {
      result[code] = value;
    }
  }
  return result;
}

function extractDerived(data) {
  const result = {};
  const ann = data?.annotationsDerived?.annotations || data?.annotations?.annotations;
  if (!ann) return result;
  for (const [code, value] of Object.entries(ann)) {
    if (typeof value === 'object' && value.tts) {
      result[code] = value.tts[0] || '';
    } else if (typeof value === 'string') {
      result[code] = value;
    }
  }
  return result;
}

// Extraer keywords (sinónimos, aliases) del objeto de anotación completo
function extractKeywords(data) {
  const result = {};
  const ann = data?.annotations?.annotations || data?.annotationsDerived?.annotations;
  if (!ann) return result;
  for (const [code, value] of Object.entries(ann)) {
    if (typeof value !== 'object') continue;
    const terms = [];
    // tts es el nombre corto; puede haber más arrays con keywords
    if (Array.isArray(value.tts)) terms.push(...value.tts);
    if (Array.isArray(value.keywords)) terms.push(...value.keywords);
    // Algunas versiones de CLDR ponen keywords como valores directos
    for (const key of Object.keys(value)) {
      if (key === 'tts' || key === 'keywords') continue;
      if (Array.isArray(value[key])) terms.push(...value[key]);
    }
    if (terms.length) {
      result[code] = terms.map(t => String(t).toLowerCase().trim()).filter(Boolean);
    }
  }
  return result;
}

function clean(str) {
  return String(str).toLowerCase().replace(/[:,]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function main() {
  console.log('Fetching Unicode CLDR annotations (en + es)...');

  const [enBase, enDerived, esBase, esDerived] = await Promise.all([
    fetchJSON(`${BASE_URL}/cldr-annotations-full/annotations/en/annotations.json`),
    fetchJSON(`${BASE_URL}/cldr-annotations-derived-full/annotationsDerived/en/annotations.json`),
    fetchJSON(`${BASE_URL}/cldr-annotations-full/annotations/es/annotations.json`),
    fetchJSON(`${BASE_URL}/cldr-annotations-derived-full/annotationsDerived/es/annotations.json`)
  ]);

  // Nombres en inglés (TTS = nombre corto para mostrar)
  const enNames = { ...extractNames(enBase), ...extractNames(enDerived) };
  // Nombres en español
  const esNames = { ...extractNames(esBase), ...extractNames(esDerived) };

  // Keywords de ambos idiomas (sinónimos, aliases)
  const enKeywords = {};
  for (const [k, v] of Object.entries(extractKeywords(enBase))) {
    enKeywords[k] = [...(enKeywords[k] || []), ...v];
  }
  for (const [k, v] of Object.entries(extractKeywords(enDerived))) {
    enKeywords[k] = [...(enKeywords[k] || []), ...v];
  }
  const esKeywords = {};
  for (const [k, v] of Object.entries(extractKeywords(esBase))) {
    esKeywords[k] = [...(esKeywords[k] || []), ...v];
  }
  for (const [k, v] of Object.entries(extractKeywords(esDerived))) {
    esKeywords[k] = [...(esKeywords[k] || []), ...v];
  }

  const entries = [];
  const seen = new Set();

  // Recolectar todos los códigos de emoji de todas las fuentes
  const allCodes = new Set([
    ...Object.keys(enNames),
    ...Object.keys(esNames),
    ...Object.keys(enKeywords),
    ...Object.keys(esKeywords)
  ]);

  for (const emoji of allCodes) {
    const enName = enNames[emoji];
    const esName = esNames[emoji];
    const primaryName = enName || esName;
    if (!primaryName) continue;
    // Skip single ASCII chars and basic punctuation
    if (emoji.length === 1 && emoji.charCodeAt(0) < 0x2000) continue;
    // Skip skin tone modifiers, tag characters, ZWJ standalone
    if (/^[\u{1F3FB}-\u{1F3FF}]$/u.test(emoji)) continue;
    if (emoji.includes('\u{E007F}')) continue;
    // Skip keycap sequences
    if (/^[\d#*]\uFE0F\u20E3$/.test(emoji)) continue;

    if (seen.has(emoji)) continue;
    seen.add(emoji);

    const name = clean(primaryName);

    // Recopilar keywords: nombre en inglés + español + sinónimos de ambos idiomas
    const allTerms = new Set();
    allTerms.add(name);
    if (enName) allTerms.add(clean(enName));
    if (esName) allTerms.add(clean(esName));
    for (const kw of (enKeywords[emoji] || [])) {
      const c = clean(kw);
      if (c) allTerms.add(c);
    }
    for (const kw of (esKeywords[emoji] || [])) {
      const c = clean(kw);
      if (c) allTerms.add(c);
    }

    // Keywords como string para búsqueda (sin duplicar el nombre principal)
    const keywords = [...allTerms].filter(t => t !== name).join(' ');

    entries.push({ emoji, name, keywords });
  }

  entries.sort((a, b) => a.name.localeCompare(b.name));

  const output =
    `// Auto-generated from Unicode CLDR (en + es). DO NOT EDIT.\n` +
    `// Regenerate: node generate-emoji-data.mjs\n` +
    `const EMOJI_LIST = ${JSON.stringify(entries)};\n`;

  writeFileSync('emojis.js', output, 'utf8');
  console.log(`${entries.length} emojis -> emojis.js (${(output.length / 1024).toFixed(0)} KB)`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
