const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Allowed tags for rich announcements
const ALLOWED_TAGS = [
  'p', 'br', 'hr',
  'b', 'strong', 'i', 'em', 'u', 's', 'del', 'ins',
  'a', 'span', 'div',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'code', 'pre',
  'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
];

// Allowed attributes
const ALLOWED_ATTR = [
  'href', 'title', 'target', 'rel',
  'src', 'alt', 'width', 'height',
  'style', 'class', 'id',
  'colspan', 'rowspan'
];

// Allowed CSS properties in style attribute
const ALLOWED_CSS = [
  'color', 'background-color', 'font-size', 'font-weight',
  'text-align', 'padding', 'margin', 'border',
  'width', 'height', 'max-width'
];

const sanitizeAnnouncementHTML = (dirtyHtml) => {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') {
    return '';
  }

  const clean = DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    KEEP_CONTENT: true,
    SANITIZE_DOM: true,
    ALLOW_DATA_ATTR: false,
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'button'],
    // Custom hook to strip dangerous URLs
    uponSanitizeAttribute: (node, data) => {
      if (data.attrName === 'href' || data.attrName === 'src') {
        const url = data.attrValue.toLowerCase().trim();
        // Block javascript:, data:, vbscript: protocols
        if (/^(javascript|data|vbscript|file):/i.test(url)) {
          data.attrValue = '#';
        }
        // Force external links to open in new tab with rel="noopener noreferrer"
        if (data.attrName === 'href' && /^https?:\/\//i.test(url)) {
          node.setAttribute('target', '_blank');
          node.setAttribute('rel', 'noopener noreferrer nofollow');
        }
      }
      // Clean style attribute
      if (data.attrName === 'style') {
        const styles = data.attrValue.split(';');
        const cleanStyles = styles.filter(style => {
          const prop = style.split(':')[0].trim().toLowerCase();
          return ALLOWED_CSS.includes(prop);
        });
        data.attrValue = cleanStyles.join(';');
      }
    }
  });

  return clean;
};

module.exports = { sanitizeAnnouncementHTML };