import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'jotai-query-toolkit': path.resolve('../../src'),
    },
  },
  plugins: [reactRefresh()],
});
