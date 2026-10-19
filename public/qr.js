/* مولّد QR مستقل (بدون مكتبات) — وضع البايت، مستوى تصحيح M، النسخ 1–10 (حتى 213 بايت). */
(function (root) {
  'use strict';
  // [إجمالي الكلمات, كلمات التصحيح لكل كتلة, [عدد كتل المجموعة1, بيانات الكتلة], [عدد كتل المجموعة2, بيانات الكتلة]]
  var VERS = [null,
    [26, 10, [1, 16], [0, 0]], [44, 16, [1, 28], [0, 0]], [70, 26, [1, 44], [0, 0]], [100, 18, [2, 32], [0, 0]],
    [134, 24, [2, 43], [0, 0]], [172, 16, [4, 27], [0, 0]], [196, 18, [4, 31], [0, 0]], [242, 22, [2, 38], [2, 39]],
    [292, 22, [3, 36], [2, 37]], [346, 26, [4, 43], [1, 44]]];
  var ALIGN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];

  function dataCap(v) { var s = VERS[v]; return s[2][0] * s[2][1] + s[3][0] * s[3][1]; }

  // GF(256)
  function gmul(a, b) { var z = 0; for (var i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((b >>> i) & 1) * a; } return z & 255; }
  function rsGen(deg) {
    var r = []; for (var i = 0; i < deg - 1; i++) r.push(0); r.push(1);
    var root = 1;
    for (i = 0; i < deg; i++) {
      for (var j = 0; j < r.length; j++) { r[j] = gmul(r[j], root); if (j + 1 < r.length) r[j] ^= r[j + 1]; }
      root = gmul(root, 2);
    }
    return r;
  }
  function rsRem(data, gen) {
    var res = gen.map(function () { return 0; });
    data.forEach(function (b) {
      var f = b ^ res.shift(); res.push(0);
      gen.forEach(function (c, i) { res[i] ^= gmul(c, f); });
    });
    return res;
  }
  function utf8(s) { return Array.prototype.slice.call(unescape(encodeURIComponent(s))).map(function (c) { return c.charCodeAt(0); }); }
  function bit(x, i) { return ((x >>> i) & 1) !== 0; }

  function encode(text) {
    var bytes = utf8(text), ver = 0;
    for (var v = 1; v <= 10; v++) { var cc = v < 10 ? 8 : 16; if (Math.ceil((4 + cc + bytes.length * 8) / 8) <= dataCap(v)) { ver = v; break; } }
    if (!ver) throw new Error('QR: النص طويل جداً');
    var bits = [];
    function put(val, len) { for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
    put(4, 4); put(bytes.length, ver < 10 ? 8 : 16); bytes.forEach(function (b) { put(b, 8); });
    var capBits = dataCap(ver) * 8;
    put(0, Math.min(4, capBits - bits.length));
    while (bits.length % 8) bits.push(0);
    var data = []; for (var i = 0; i < bits.length; i += 8) { var n = 0; for (var k = 0; k < 8; k++) n = (n << 1) | bits[i + k]; data.push(n); }
    for (var pad = 0xEC; data.length < dataCap(ver); pad ^= 0xEC ^ 0x11) data.push(pad);

    // الكتل + Reed-Solomon + التضفير
    var s = VERS[ver], ecLen = s[1], gen = rsGen(ecLen), blocks = [], pos = 0;
    [s[2], s[3]].forEach(function (g) { for (var b = 0; b < g[0]; b++) { var d = data.slice(pos, pos + g[1]); pos += g[1]; blocks.push({ d: d, e: rsRem(d, gen) }); } });
    var all = [], maxD = Math.max(s[2][1], s[3][1]);
    for (i = 0; i < maxD; i++) blocks.forEach(function (b) { if (i < b.d.length) all.push(b.d[i]); });
    for (i = 0; i < ecLen; i++) blocks.forEach(function (b) { all.push(b.e[i]); });

    var size = ver * 4 + 17, m = [], fn = [];
    for (i = 0; i < size; i++) { m.push(new Array(size).fill(false)); fn.push(new Array(size).fill(false)); }
    function set(x, y, d) { m[y][x] = d; fn[y][x] = true; }
    for (i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    function finder(cx, cy) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var x = cx + dx, y = cy + dy, dist = Math.max(Math.abs(dx), Math.abs(dy));
        if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, dist !== 2 && dist !== 4);
      }
    }
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    var ap = ALIGN[ver], last = ap.length - 1;
    ap.forEach(function (ay, a) { ap.forEach(function (ax, b) {
      if ((a === 0 && b === 0) || (a === 0 && b === last) || (a === last && b === 0)) return;
      for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) set(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }); });
    function formatBits(mask) {
      var d = mask, rem = d; for (var j = 0; j < 10; j++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var bt = ((d << 10) | rem) ^ 0x5412;
      for (j = 0; j <= 5; j++) set(8, j, bit(bt, j));
      set(8, 7, bit(bt, 6)); set(8, 8, bit(bt, 7)); set(7, 8, bit(bt, 8));
      for (j = 9; j < 15; j++) set(14 - j, 8, bit(bt, j));
      for (j = 0; j < 8; j++) set(size - 1 - j, 8, bit(bt, j));
      for (j = 8; j < 15; j++) set(8, size - 15 + j, bit(bt, j));
      set(8, size - 8, true);
    }
    formatBits(0);
    if (ver >= 7) {
      var rem = ver; for (i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
      var vb = (ver << 12) | rem;
      for (i = 0; i < 18; i++) { var c = bit(vb, i), a2 = size - 11 + (i % 3), b2 = Math.floor(i / 3); set(a2, b2, c); set(b2, a2, c); }
    }
    // وضع الكلمات
    var idx = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) for (var j2 = 0; j2 < 2; j2++) {
        var x = right - j2, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert;
        if (!fn[y][x] && idx < all.length * 8) { m[y][x] = bit(all[idx >>> 3], 7 - (idx & 7)); idx++; }
      }
    }
    function mask(mk) {
      for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) {
        var inv; switch (mk) {
          case 0: inv = (x + y) % 2 === 0; break; case 1: inv = y % 2 === 0; break; case 2: inv = x % 3 === 0; break;
          case 3: inv = (x + y) % 3 === 0; break; case 4: inv = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: inv = x * y % 2 + x * y % 3 === 0; break; case 6: inv = (x * y % 2 + x * y % 3) % 2 === 0; break;
          default: inv = ((x + y) % 2 + x * y % 3) % 2 === 0;
        }
        if (!fn[y][x] && inv) m[y][x] = !m[y][x];
      }
    }
    function penalty() {
      var sc = 0, dark = 0, y, x, lines = [];
      for (y = 0; y < size; y++) { var row = ''; for (x = 0; x < size; x++) { row += m[y][x] ? '1' : '0'; if (m[y][x]) dark++; } lines.push(row); }
      for (x = 0; x < size; x++) { var col = ''; for (y = 0; y < size; y++) col += m[y][x] ? '1' : '0'; lines.push(col); }
      lines.forEach(function (ln) {
        var run = 1; for (var q = 1; q <= ln.length; q++) { if (ln[q] === ln[q - 1]) run++; else { if (run >= 5) sc += 3 + run - 5; run = 1; } }
        var p; for (p = ln.indexOf('1011101'); p !== -1; p = ln.indexOf('1011101', p + 1)) {
          if ((p >= 4 && ln.substr(p - 4, 4) === '0000') || ln.substr(p + 7, 4) === '0000') sc += 40;
        }
      });
      for (y = 0; y < size - 1; y++) for (x = 0; x < size - 1; x++) if (m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) sc += 3;
      var tot = size * size; sc += (Math.ceil(Math.abs(dark * 20 - tot * 10) / tot) - 1) * 10;
      return sc;
    }
    var best = 0, bestPen = Infinity;
    for (var mk = 0; mk < 8; mk++) { mask(mk); formatBits(mk); var p2 = penalty(); if (p2 < bestPen) { bestPen = p2; best = mk; } mask(mk); }
    mask(best); formatBits(best);
    return { size: size, version: ver, modules: m };
  }

  function svg(text, opt) {
    opt = opt || {}; var q = encode(text), mg = opt.margin == null ? 4 : opt.margin, n = q.size + mg * 2, d = '';
    for (var y = 0; y < q.size; y++) for (var x = 0; x < q.size; x++) if (q.modules[y][x]) d += 'M' + (x + mg) + ',' + (y + mg) + 'h1v1h-1z';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + n + ' ' + n + '" shape-rendering="crispEdges" role="img" aria-label="QR">' +
      '<rect width="100%" height="100%" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>';
  }
  var API = { encode: encode, svg: svg };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.QR = API;
})(typeof window !== 'undefined' ? window : globalThis);
