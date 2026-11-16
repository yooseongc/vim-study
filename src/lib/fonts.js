import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import '@fontsource/fira-code/latin-400.css';
import '@fontsource/fira-code/latin-700.css';
import '@fontsource/source-code-pro/latin-400.css';
import '@fontsource/source-code-pro/latin-700.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-700.css';
import '@fontsource/inconsolata/latin-400.css';
import '@fontsource/inconsolata/latin-700.css';
import { bundledFonts } from './storage.js';

export async function loadEditorFont({ family, size }) {
  if (bundledFonts.includes(family)) {
    await Promise.all(
      [400, 700].map((weight) => document.fonts.load(`${weight} ${size}px "${family}"`)),
    );
  }
}
export function vimFont(settings) {
  return `${settings.family}:h${settings.size}`;
}
