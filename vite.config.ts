import path, { dirname } from 'path';
import { defineConfig, loadEnv, UserConfigExport, ConfigEnv } from 'vite';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig((configEnv: ConfigEnv): UserConfigExport => {
  const env = loadEnv(configEnv.mode, process.cwd());
  return {
    base: '/PBL/', // Correct base for GitHub Pages
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
