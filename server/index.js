import app from './src/app.js';
import { config } from './src/config/env.js';

app.listen(config.port, () => {
    console.log(`
🚀 Backend Proxy running on http://localhost:${config.port}
Target Zuper API: ${config.zuper.baseUrl}
  `);
});
