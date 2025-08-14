import Util from '/src/config/Util';

export const args = {};
export const pages = {};
export const app = {
  setPages() {
    app.makePage('top', '/', 'Top');
    app.makePage('subpage', '/subpage', 'Sub page');
  },
  preInit() {
    args.siteName = '__SITE_NAME__';
    args.titleSuffix = '__TITLE_SUFFIX__';
    args.description = '__DESCRIPTION__';
    args.twitterIdWithAtMark = '__@TWITTER_ID__';
    args.lang = 'ja';
    args.locale = 'ja_JP';
    args.og_image = 'img/global/og.png';
  },
  postInit(Astro, pageArgs) {
    app.Astro = Astro;
    app.args = pageArgs ?? {};

    // Overwrite args parameters
    Object.entries(app.args).forEach(([key, value]) => {
      args[key] = value;
    });
    // <title>PAGE_TITLE - SITE_NAME | TITLE_SUFFIX</title>
    args.title = Util.concatStr(app.args.title, { suffix: ' - ' }) + args.siteName + Util.concatStr(args.titleSuffix, { prefix: ' | '});

    args.og_type = args.path === '/' ? 'website' : 'article';
    if (!isAbsUrl(args.og_image)) args.og_image = assetsUrl(args.og_image, true);

    app.autoConfig();
  },
  autoConfig() {
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
  init(Astro, pageArgs) {
    app.setPages();
    app.preInit();
    if (Astro) app.postInit(Astro, pageArgs);
  },
};

export const rootPath = (path) => {
  path = '/' + Util.ltrim(path);
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
