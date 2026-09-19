// Unicode mapping tables for LinkedIn compatible styling
// These render identically across mobile apps and desktop browsers.

export type StyleType = 
  | 'bold' 
  | 'bold-serif' 
  | 'italic' 
  | 'monospace' 
  | 'strikethrough' 
  | 'underline'
  | 'bullet'
  | 'check'
  | 'arrow'
  | 'numbered';

const toBoldSans = (char: string): string => {
  const code = char.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D5D4 + code - 65); // A-Z
  if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D5EE + code - 97); // a-z
  if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7EC + code - 48); // 0-9
  return char;
};

const toBoldSerif = (char: string): string => {
  const code = char.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D400 + code - 65); // A-Z
  if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D41A + code - 97); // a-z
  if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7CE + code - 48); // 0-9
  return char;
};

const toItalic = (char: string): string => {
  const code = char.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D608 + code - 65); // A-Z
  if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D622 + code - 97); // a-z
  return char;
};

const toMonospace = (char: string): string => {
  const code = char.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D670 + code - 65); // A-Z
  if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D68A + code - 97); // a-z
  if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7F6 + code - 48); // 0-9
  return char;
};

export const convertText = (text: string, style: StyleType): string => {
  switch (style) {
    case 'bold':
      return Array.from(text).map(toBoldSans).join('');
    case 'bold-serif':
      return Array.from(text).map(toBoldSerif).join('');
    case 'italic':
      return Array.from(text).map(toItalic).join('');
    case 'monospace':
      return Array.from(text).map(toMonospace).join('');
    case 'strikethrough':
      return Array.from(text).map(c => c === ' ' ? ' ' : c + '\u0336').join('');
    case 'underline':
      return Array.from(text).map(c => c === ' ' ? ' ' : c + '\u0332').join('');
    case 'bullet':
      return text.split('\n').map(line => line.trim() ? `• ${line.replace(/^[•▪✓→\-\*]\s*/, '')}` : line).join('\n');
    case 'check':
      return text.split('\n').map(line => line.trim() ? `✓ ${line.replace(/^[•▪✓→\-\*]\s*/, '')}` : line).join('\n');
    case 'arrow':
      return text.split('\n').map(line => line.trim() ? `→ ${line.replace(/^[•▪✓→\-\*]\s*/, '')}` : line).join('\n');
    case 'numbered':
      let count = 1;
      return text.split('\n').map(line => {
        if (!line.trim()) return line;
        const cleaned = line.replace(/^\d+[\.\)]\s*/, '');
        return `${count++}. ${cleaned}`;
      }).join('\n');
    default:
      return text;
  }
};

/**
 * Applies the given style to the selected text inside a textarea.
 * Returns the updated complete string and the new cursor positions.
 */
export const applyStyleToSelection = (
  fullText: string,
  start: number,
  end: number,
  style: StyleType
): { newText: string; newStart: number; newEnd: number } => {
  if (start === end) {
    // No text selected: for list styles, prefix current line; for inline styles, insert sample text
    if (['bullet', 'check', 'arrow', 'numbered'].includes(style)) {
      const prefix = style === 'bullet' ? '• ' : style === 'check' ? '✓ ' : style === 'arrow' ? '→ ' : '1. ';
      const before = fullText.slice(0, start);
      const after = fullText.slice(end);
      const newText = before + prefix + after;
      return {
        newText,
        newStart: start + prefix.length,
        newEnd: start + prefix.length
      };
    } else {
      const sample = style === 'bold' ? 'Bold Text' : style === 'italic' ? 'Italic Text' : 'Code';
      const transformed = convertText(sample, style);
      const before = fullText.slice(0, start);
      const after = fullText.slice(end);
      return {
        newText: before + transformed + after,
        newStart: start,
        newEnd: start + transformed.length
      };
    }
  }

  const before = fullText.slice(0, start);
  const target = fullText.slice(start, end);
  const after = fullText.slice(end);

  const transformed = convertText(target, style);
  const newText = before + transformed + after;

  return {
    newText,
    newStart: start,
    newEnd: start + transformed.length
  };
};
