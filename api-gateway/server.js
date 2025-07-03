import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import cors from 'cors';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
app.use(cors());

// Proxy các route auth và user sang Flask exp-service
app.use('/api/auth', createProxyMiddleware({
    target: 'http://localhost:5000',
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '/api/auth' }
}));
app.use('/api/users', createProxyMiddleware({
    target: 'http://localhost:5000',
    changeOrigin: true,
    pathRewrite: { '^/api/users': '/api/users' }
}));

// Proxy route ranking sang ranking_service (Next.js)
app.use('/api/ranking', createProxyMiddleware({
    target: 'http://localhost:3000', // Next.js ranking_service
    changeOrigin: true,
    pathRewrite: { '^/api/ranking': '/api/ranking' }
}));

// Proxy route tasks sang exp-service (Flask)
app.use('/api/tasks', createProxyMiddleware({
    target: 'http://localhost:5000', // Flask exp-service
    changeOrigin: true,
    pathRewrite: { '^/api/tasks': '/api/tasks' },
    onProxyReq: (proxyReq, req) => {
        if (req.headers['authorization']) {
            proxyReq.setHeader('authorization', req.headers['authorization']);
        }
    }
}));

// Proxy route notification sang notification_service (Next.js)
app.use('/api/notification', createProxyMiddleware({
    target: 'http://localhost:3003', // Next.js notification_service
    changeOrigin: true,
    pathRewrite: { '^/api/notification': '/api/notification' }
}));

app.get('/', (req, res) => {
    res.send('API Gateway is running!');
});

app.listen(PORT, () => {
    console.log(`API Gateway listening at http://localhost:${PORT}`);
});
