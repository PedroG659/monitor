const express = require('express');
const client = require('prom-client');

const app = express();

// Coleta de métricas padrão (CPU, memória, etc.)
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

// Métrica personalizada — contador de requisições
const counter = new client.Counter({
  name: 'app_requests_total',
  help: 'Contador de requisições recebidas'
});

// Endpoint principal
app.get('/', (req, res) => {
  counter.inc();
  res.send('Hello, Prometheus + Grafana + Kubernetes!');
});

// Endpoint de métricas — Prometheus coleta aqui
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
