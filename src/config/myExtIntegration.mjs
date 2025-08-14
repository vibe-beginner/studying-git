import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import beautify from 'js-beautify';
import { app, args, pages } from '/src/config/view';

function htmlFormatter(filePath) {
  const config = {
    end_with_newline: true,
    extra_liners: [],
    indent_char: ' ',
    indent_empty_lines: false,
    indent_inner_html: false,
    indent_scripts: 'keep',
    indent_size: 2,
    wrap_line_length: 0,
  };

  const inputHtml = fs.readFileSync(filePath, { encoding: 'utf8' });
  const outputHtml = beautify.html(inputHtml, config);
  fs.writeFileSync(filePath, outputHtml);
}

function exportAstroConfigJson(projectDir) {
  const filePath = path.join(projectDir, 'astro.json');
  app.init();
  const obj = { args, pages };
  const json = JSON.stringify(obj, null, 2) + '\n';
  fs.writeFileSync(filePath, json);
}

export default function() {
  return {
    name: 'myExt:integration',
    hooks: {
      'astro:build:generated': (options) => {
        const projectDir = path.dirname(options.dir.pathname);
        exportAstroConfigJson(projectDir);

        globSync(`${options.dir.pathname}**/*.html`).forEach((filePath) => {
          htmlFormatter(filePath);
        });
      },
    },
  };
};
