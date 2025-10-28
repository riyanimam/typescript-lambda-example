function parse(input, options) {
  if (!input) return [];
  const text = String(input).trim();
  if (text === '') return [];
  const lines = text.split(/\r?\n/);
  if (options && options.columns) {
    const headers = lines
      .shift()
      .split(',')
      .map((h) => h.trim());
    return lines.map((line) => {
      const parts = line.split(',').map((p) => p.trim());
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = parts[i] ?? '';
      });
      return obj;
    });
  }
  return lines.map((line) => line.split(',').map((p) => p.trim()));
}

module.exports = { parse };
