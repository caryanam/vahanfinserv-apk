// src/services/fileUtils.js

/**
 * Sanitize a file name for safe upload.
 * Removes special characters, emojis, unicode weirdness,
 * and cleans up names that come from ChatGPT / WhatsApp / Downloads etc.
 *
 * Rules:
 *  1. Strip any path segments (keep only the file name)
 *  2. Remove anything that is NOT alphanumeric, dot, hyphen, underscore, or space
 *  3. Collapse multiple spaces / underscores / hyphens into one
 *  4. Trim leading/trailing whitespace, dots, hyphens, underscores
 *  5. If the name becomes empty, generate a fallback using the document type + timestamp
 *  6. Ensure the extension is preserved
 */

const SAFE_CHAR = /[^a-zA-Z0-9.\-_ ]/g;
const MULTI_SEP = /[\s_-]{2,}/g;

export const sanitizeFileName = (rawName, docType = 'document') => {
  if (!rawName || typeof rawName !== 'string') {
    return `${docType}_${Date.now()}.jpg`;
  }

  // 1. Strip path (handle both / and \)
  let name = rawName.split(/[/\\]/).pop() || rawName;

  // 2. Separate extension
  const dotIdx = name.lastIndexOf('.');
  let base = dotIdx > 0 ? name.substring(0, dotIdx) : name;
  let ext = dotIdx > 0 ? name.substring(dotIdx) : '';

  // 3. Clean extension
  ext = ext.replace(SAFE_CHAR, '').toLowerCase();
  if (ext && !ext.startsWith('.')) {
    ext = '.' + ext;
  }

  // 4. Clean base name
  base = base
    .replace(SAFE_CHAR, '_')   // replace unsafe chars with underscore
    .replace(MULTI_SEP, '_')   // collapse multiple separators
    .replace(/^[.\-_ ]+/, '')  // trim leading junk
    .replace(/[.\-_ ]+$/, ''); // trim trailing junk

  // 5. Fallback if empty
  if (!base) {
    base = `${docType}_${Date.now()}`;
  }

  // 6. Fallback extension
  if (!ext) {
    ext = '.jpg';
  }

  return `${base}${ext}`;
};

export default sanitizeFileName;
