import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { execFileSync } from 'node:child_process';
import { setTimeout as pause } from 'node:timers/promises';

const api = new URL(process.env.TASKFLOW_LOAD_API ?? 'http://localhost:5000');
if (!['localhost', '127.0.0.1'].includes(api.hostname)) throw new Error('Use a API local de teste.');

const sqlServer = '(localdb)\\MSSQLLocalDB';
const database = 'TaskFlow_Carga';
const users = 10;
const tasksPerUser = 1000;
const warmupSeconds = 30;
const durationSeconds = 300;
const intervalMs = 200;
const date = new Date().toISOString().slice(0, 10);
const output = '.tools/load-test';
const runId = randomBytes(5).toString('hex');
const routes = {
  listagem: `/api/app/tarefa?maxResultCount=10&sorting=DataCriacao%20DESC%2C%20Id%20DESC&dataReferencia=${date}`,
  resumo: `/api/app/tarefa/resumo?dataReferencia=${date}`,
};
const password = `Aa9!${randomBytes(20).toString('hex')}`;

async function request(path, options) {
  const response = await fetch(new URL(path, api), { ...options, signal: AbortSignal.timeout(10000) });
  const body = await response.text();
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return JSON.parse(body);
}

const clients = [];
for (let i = 0; i < users; i++) {
  const userName = `carga-${runId}-${i + 1}`;
  const user = await request('/api/account/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    body: JSON.stringify({ userName, emailAddress: `${userName}@example.test`, password, appName: 'Angular' }),
  });
  if (!/^[\da-f-]{36}$/i.test(user.id)) throw new Error('ID de teste inválido.');
  const token = await request('/connect/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: 'TaskFlow_App', grant_type: 'password', username: userName, password, scope: 'TaskFlow',
    }),
  });
  if (!token.access_token) throw new Error('Token de teste ausente.');
  clients.push({ id: user.id, headers: { Authorization: `Bearer ${token.access_token}` } });
}

await mkdir(output, { recursive: true });
const rows = clients.map(({ id }) => `(CONVERT(uniqueidentifier, '${id}'))`).join(',\n');
const seed = `
SET NOCOUNT ON;
WITH Pessoas(Id) AS (SELECT Id FROM (VALUES ${rows}) AS u(Id)),
Numeros(n) AS (SELECT TOP (${tasksPerUser}) ROW_NUMBER() OVER (ORDER BY (SELECT NULL))
               FROM sys.all_objects a CROSS JOIN sys.all_objects b)
INSERT dbo.Tarefas (Id, Titulo, Descricao, Status, Prioridade, Prazo, DataCriacao,
                    CreationTime, CreatorId, ConcurrencyStamp, ExtraProperties)
SELECT NEWID(), CONCAT('Tarefa sintetica ', n), 'Registro sintetico do teste de carga',
       n % 2, n % 3, DATEADD(day, n % 31 - 15, CAST('${date}' AS date)),
       DATEADD(second, -n, SYSUTCDATETIME()), SYSUTCDATETIME(),
       Pessoas.Id, REPLACE(CONVERT(varchar(36), NEWID()), '-', ''), '{}'
FROM Pessoas CROSS JOIN Numeros;
`;
const seedFile = `${output}/seed-${runId}.sql`;
await writeFile(seedFile, seed, 'utf8');
execFileSync('sqlcmd', ['-S', sqlServer, '-E', '-d', database, '-b', '-i', seedFile], { stdio: 'inherit' });

for (const { headers } of clients) {
  const list = await request(routes.listagem, { headers });
  const summary = await request(routes.resumo, { headers });
  if (list.totalCount !== tasksPerUser || summary.pendentes + summary.concluidas !== tasksPerUser) {
    throw new Error('A API deve apontar para TaskFlow_Carga e retornar 1.000 tarefas por usuário.');
  }
}

async function run(seconds, samples) {
  const until = performance.now() + seconds * 1000;
  await Promise.all(clients.map(async ({ headers }, index) => {
    await pause(index * intervalMs / users);
    let sequence = index;
    while (performance.now() < until) {
      const name = sequence++ % 2 === 0 ? 'listagem' : 'resumo';
      const start = performance.now();
      let success = false;
      try {
        await request(routes[name], { headers });
        success = true;
      } catch {
        // Inclui respostas HTTP com erro e falhas de rede nos totais.
      }
      const ms = performance.now() - start;
      if (samples) samples[name].push({ ms, success });
      await pause(Math.max(0, intervalMs - ms));
    }
  }));
}

console.log(`Base confirmada: ${users} usuários × ${tasksPerUser} tarefas. Aquecendo por ${warmupSeconds}s.`);
await run(warmupSeconds);
console.log(`Medição iniciada por ${durationSeconds}s.`);
const samples = { listagem: [], resumo: [] };
await run(durationSeconds, samples);
const results = Object.fromEntries(Object.entries(samples).map(([name, records]) => {
  const ok = records.filter(entry => entry.success).map(entry => entry.ms).sort((a, b) => a - b);
  const percentile = p => ok.length ? Number(ok[Math.ceil(ok.length * p) - 1].toFixed(2)) : null;
  return [name, {
    amostras: records.length, erros: records.length - ok.length,
    p50Ms: percentile(0.5), p95Ms: percentile(0.95), p99Ms: percentile(0.99),
  }];
}));
const report = { date, users, tasksPerUser, warmupSeconds, durationSeconds, intervalMs, results };
await writeFile(`${output}/resultado.json`, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (Object.values(results).some(result => result.p95Ms === null || result.p95Ms > 500 || result.erros)) process.exitCode = 1;
