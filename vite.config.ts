import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        hangman: 'hangman/index.html',
        'hangman-layla': 'hangman/layla/index.html',
        mathquest: 'mathquest/index.html',
        'mathquest-layla': 'mathquest/layla/index.html',
        spellingbee: 'spellingbee/index.html',
        'spellingbee-layla': 'spellingbee/layla/index.html',
        mapexplorer: 'mapexplorer/index.html',
        'mapexplorer-layla': 'mapexplorer/layla/index.html'
      }
    }
  }
});
