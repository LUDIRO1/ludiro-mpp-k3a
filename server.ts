import express from 'express';
import path from 'path';
import { shippingApiMiddleware } from './server/api.ts';

const app = express();
const PORT = process.env.PORT || 3000;

// Mount API middleware
app.use((req, res, next) => {
  shippingApiMiddleware(req, res, next);
});

// Serve static assets from dist if available
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
