import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'./tests', testMatch:'**/*.spec.js', timeout:60000, workers:1,
 use:{baseURL:process.env.PLAY_URL || 'http://127.0.0.1:5273',viewport:{width:1440,height:1000},screenshot:'only-on-failure',trace:'retain-on-failure'},
 webServer:process.env.PLAY_URL ? undefined : {command:'npm run dev -- --port 5273 --strictPort',url:'http://127.0.0.1:5273',reuseExistingServer:false},
 reporter:'list',
});
