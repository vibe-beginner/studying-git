import astroConfig from '/astro.config';
import Util from '/src/config/Util';

export const args = {};
export const pages = {};
export const app = {
  setPages() {
    app.makePage('top', '/', 'Top');
    app.makePage('docs/1', '/docs/1', '【第1部】Git + VS Code セットアップ');
    app.makePage('docs/2', '/docs/2', '【第2部】Git の基本とバージョン管理のしくみ');
    app.makePage('docs/2/slide', '/docs/2/slide', 'スライド：【第2部】Git の基本とバージョン管理のしくみ');
    app.makePage('docs/3', '/docs/3', '【第3部】GitHub ハンズオン');
  },
  preInit() {
    args.siteName = 'vibe-beginner';
    args.titleSuffix = '非エンジニアのためのGit/GitHub勉強会';
    args.description = '2025年8月15日(金)開催のGit/GitHub勉強会です';
    args.twitterIdWithAtMark = '@hayakawagomi';
    args.lang = 'ja';
    args.locale = 'ja_JP';
    args.og_image = 'img/global/og.png';
  },
  postInit(pageArgs) {
    app.args = pageArgs ?? {};

    // Overwrite args parameters
    Object.entries(app.args).forEach(([key, value]) => {
      args[key] = value;
    });
    // <title>PAGE_TITLE - SITE_NAME | TITLE_SUFFIX</title>
    args.title = Util.concatStr(app.args.title, { suffix: ' - ' }) + args.siteName + Util.concatStr(args.titleSuffix, { prefix: ' | '});

    args.og_type = args.path === '/' ? 'website' : 'article';
    if (!isAbsUrl(args.og_image)) args.og_image = assetsUrl(args.og_image, true);
  },
  setConfig(Astro) {
    app.Astro = Astro;
    app.url = app.Astro.url;
    args.domain = app.url.hostname;
    args.path = app.url.pathname.replace(/\.html$/, '');
    args.url = app.url.origin + args.path;
    args.siteRootUrl = app.url.origin;
    args.siteRootUrlWithoutProtocol = app.url.host;
    args.urlWithoutProtocol = app.url.host + args.path;

    const selfRoute = route(args.path);
    args.page = Object.values(pages).find((page) => page.route === selfRoute) ?? {};
    args.page.useComponents = Util.fs.getComponents(app.Astro.self.moduleId);

    args.prevent = {
      css: {},
      js: {},
    };
    args.assetList = Object.fromEntries(['css', 'js'].map((ext) => {
      const value = [];
      const willAdd = (dir, file) => {
        const path = Util.sprintf('%s/%s.%s', dir, file, ext);
        const fileExist = Util.fs.exist(Util.sprintf('public/assets/%s/%s', ext, path));
        if (fileExist) value.push(path);
      };
      if (args.page.key) willAdd('pages', args.page.key);
      args.page.useComponents.forEach((componentName) => {
        willAdd('components', componentName);
      });
      return [ext, value];
    }));
  },
  makePage(key, argRoute, label) {
    pages[key] = { key, route: route(argRoute), label };
  },
  init(Astro) {
    app.setPages();
    if (Astro) app.setConfig(Astro);
    app.preInit();
  },
  setPageConfig(pageArgs) {
    app.postInit(pageArgs);
  },
};

export const rootPath = (path) => {
  const base = Util.rtrim(astroConfig.base ?? '');
  path = base + '/' + Util.ltrim(path);
  return path;
};

export const assets = (path, cacheBuster = false) => {
  path = rootPath('assets/' + Util.ltrim(path));
  if (cacheBuster) path += '?' + Date.now();
  return path;
};

export const assetsUrl = (path, cacheBuster = false) => {
  return Util.rtrim(app.Astro.url.origin) + assets(path, cacheBuster);
};

export const isAbsUrl = (url) => {
  return /^(?:\w+:)?\/\//.test(url);
};

export const img = (path) => {
  return assets('img/' + Util.ltrim(path));
};

export const route = (path) => {
  return Util.rtrim(rootPath(String(path))) + '/';
};
