import { defineConfig } from 'astro/config';
import myExtIntegration from '/src/config/myExtIntegration';

// refs. https://astro.build/config
export const config = {
  base: '/studying-git',
  site: 'https://vibe-beginner.github.io',
  trailingSlash: 'always',
  compressHTML: false,
  integrations: [myExtIntegration()],
  build: {
    format: 'directory',
  },
};

export default defineConfig(config);
