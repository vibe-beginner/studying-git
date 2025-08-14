import astroConfig from '/astro.config';
import fs from 'fs';

const Util = {
  astro: {
    get(key) {
      const value = astroConfig[key];
      if (key === 'base') return '/' + Util.trim(value ?? '');
      return value;
    },
    removeBase(path) {
      const base = Util.astro.get('base');
      if (base === '/') return path;
      return path.startsWith(base) ? path.slice(base.length) || '/' : path;
    },
  },
  fs: {
    basePath(path) {
      return process.cwd() + '/' + Util.ltrim(path);
    },
    exist(path) {
      path = Util.fs.basePath(path);
      let isExist = false;
      try {
        const stat = fs.statSync(path);
        isExist = stat.isFile();
      } catch {}
      return isExist;
    },
    getComponents(filePath) {
      const content = fs.readFileSync(filePath, { encoding: 'utf8' });
      const matches = Array.from(content.matchAll(/^import\s*{?([^}]*)}?\s*from\s*['"]\/src\/components\b/mg));
      const components = [];
      matches.forEach((match) => {
        let str = match[1];
        str = str.replaceAll(/as\s+\w+/g, '');
        str = str.replaceAll(/\s+/g, '');
        Util.concat(components, str.split(','));
      });
      return components;
    },
  },
  HTML: {
    escape(str) {
      const map = {
        '&': '&amp;',
        "'": '&#039;',
        '"': '&quot;',
        '<': '&lt;',
        '>': '&gt;',
      };
      return str.replace(/[&'"<>]/g, (m) => map[m]);
    },
  },
  RegExp: {
    escape(str) {
      return str.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
    },
  },
  concatStr(str, params) {
    if (str == null || str === '') return '';
    if (params.prefix != null) str = params.prefix + str;
    if (params.suffix != null) str = str + params.suffix;
    return str;
  },
  sprintf(format, ...args) {
    let p = 0;
    return format.replace(/%./g, function(m) {
      if (m === '%%') return '%';
      if (m === '%s') return args[p++];
      return m;
    });
  },
  ltrim(str, char = '/') {
    return str.replaceAll(new RegExp(Util.sprintf('^[%s]+', Util.RegExp.escape(char)), 'g'), '');
  },
  rtrim(str, char = '/') {
    return str.replaceAll(new RegExp(Util.sprintf('[%s]+$', Util.RegExp.escape(char)), 'g'), '');
  },
  trim(str, char = '/') {
    return Util.rtrim(Util.ltrim(str, char), char);
  },
  Array(length) {
    const array = [];
    for (let i = 0; i < length; ++i) array.push(i + 1);
    return array;
  },
  concat(arrayA, arrayB) {
    arrayA.push(...arrayB);
  },
};

export default Util;
