const express = require('express');
const client = require('prom-client');

const app = express();

/* =============================
 *  MÉTRICAS PADRÃO
 * ============================= */
client.collectDefaultMetrics();

/* =============================
 *  MÉTRICAS CUSTOMIZADAS
 * ============================= */

// Métrica mais simples possível
const simpleRequestCounter = new client.Counter({
    name: 'app_simple_requests_total',
    help: 'Contador simples de requisições'
});

// Total de requisições detalhado
const requestCounter = new client.Counter({
    name: 'app_requests_total',
    help: 'Total de requisições recebidas pela aplicação',
    labelNames: ['method', 'route', 'status_code']
});

// Tempo de resposta
const responseTimeHistogram = new client.Histogram({
    name: 'app_response_time_seconds',
    help: 'Tempo de resposta das requisições em segundos',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5]
});

// Uso de memória heap
const memoryGauge = new client.Gauge({
    name: 'app_memory_usage_bytes',
    help: 'Uso de memória heap da aplicação em bytes'
});

// Contador de erros
const errorCounter = new client.Counter({
    name: 'app_errors_total',
    help: 'Total de erros na aplicação por tipo',
    labelNames: ['error_type']
});

// Usuários ativos simulados
const activeUsersGauge = new client.Gauge({
    name: 'app_active_users',
    help: 'Número de usuários ativos na aplicação'
});

setInterval(() => {
    const activeUsers = Math.floor(Math.random() * 100) + 1;
    activeUsersGauge.set(activeUsers);
}, 10000);


/* =============================
 *  MIDDLEWARE DE MÉTRICAS
 * ============================= */

app.use((req, res, next) => {
    // 👈 Métrica mais simples possível
    simpleRequestCounter.inc();

    const start = Date.now();

    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const routePath = req.route?.path || req.path;

        requestCounter.inc({
            method: req.method,
            route: routePath,
            status_code: res.statusCode
        });

        responseTimeHistogram.observe({
            method: req.method,
            route: routePath,
            status_code: res.statusCode
        }, duration);

        memoryGauge.set(process.memoryUsage().heapUsed);
    });

    next();
});


/* =============================
 *  ROTAS
 * ============================= */

app.get('/', (req, res) => {
    res.send("Prometheus + Grafana + Kubernetes + NGINX - Sistema de Monitoramento");
});

app.get('/healthz', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Rota de erro
app.get('/simulate-error', (req, res) => {
    errorCounter.inc({ error_type: 'simulated_error' });
    res.status(500).json({ error: 'Erro simulado para teste' });
});

// Rota de usuários (mock)
app.get('/users', (req, res) => {
    const users = Math.floor(Math.random() * 100) + 1;
    res.json({ active_users: users });
});

// Métricas Prometheus
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', client.register.contentType);
        res.end(await client.register.metrics());
    } catch (error) {
        errorCounter.inc({ error_type: 'metrics_generation_error' });
        res.status(500).json({ error: 'Erro ao gerar métricas' });
    }
});


/* =============================
 *  START DO SERVIDOR
 * ============================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
});
