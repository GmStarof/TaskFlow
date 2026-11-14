import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { chromium } from 'playwright';

async function login(page, app, username, password) {
  await page.goto(app.href);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.getByLabel(/usuário ou e-mail|username or email/i).fill(username);
  await page.getByLabel(/^(senha|password)$/i).fill(password);
  await page.getByLabel(/^(senha|password)$/i).press('Enter');
  await page.getByRole('link', { name: 'Ver minhas tarefas' }).waitFor();
}

async function tabTo(page, target) {
  for (let step = 0; step < 30; step++) {
    if (await target.evaluate(element => element === document.activeElement)) return;
    await page.keyboard.press('Tab');
  }
  assert.fail('O controle não recebeu foco por Tab.');
}

function localApp() {
  const app = new URL(process.env.TASKFLOW_E2E_URL ?? 'http://localhost:4200');
  assert.ok(['localhost', '127.0.0.1'].includes(app.hostname), 'Use uma instância local com dados de teste.');
  const username = process.env.TASKFLOW_E2E_USER;
  const password = process.env.TASKFLOW_E2E_PASSWORD;
  assert.ok(username && password, 'Defina as credenciais da base de verificação.');
  return { app, username, password };
}

test('gerencia tarefas pessoais em um navegador', { timeout: 120000 }, async () => {
  const { app, username, password } = localApp();

  const browser = await chromium.launch({ channel: process.env.TASKFLOW_E2E_CHANNEL || undefined });
  try {
    const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
    await login(page, app, username, password);
    await page.getByRole('link', { name: /^Para hoje/ }).waitFor();

    await page.getByRole('link', { name: 'Ver minhas tarefas' }).click();
    await page.getByRole('button', { name: 'Nova tarefa', exact: true }).click();
    const titulo = `Tarefa E2E ${randomUUID().slice(0, 12)}`;
    await page.getByLabel('Título', { exact: true }).fill(titulo);
    await page.getByLabel('Descrição', { exact: true }).fill('Registro sintético de verificação.');
    await page.getByLabel('Prioridade', { exact: true }).last().selectOption({ label: 'Alta' });
    await page.getByLabel('Prazo (opcional)').fill('2025-01-01');
    await page.getByRole('button', { name: 'Salvar', exact: true }).click();
    await page.getByText('Tarefa criada.', { exact: true }).waitFor();

    let falhou = false;
    await page.route(url => url.pathname === '/api/app/tarefa', async route => {
      if (!falhou && route.request().method() === 'GET') {
        falhou = true;
        await route.fulfill({ status: 503, json: { error: { message: 'Indisponível no cenário de teste' } } });
      } else {
        await route.continue();
      }
    });
    await page.getByRole('searchbox', { name: 'Buscar tarefas' }).fill(titulo);
    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    await page.getByRole('button', { name: 'Atrasadas', exact: true }).click();
    await page.getByLabel('Prioridade', { exact: true }).selectOption({ label: 'Alta' });
    const heading = page.getByRole('heading', { name: titulo, exact: true });
    await heading.waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));

    await page.getByRole('button', { name: `Concluir ${titulo}` }).click();
    await page.getByText('Tarefa concluída.', { exact: true }).waitFor();
    await heading.waitFor({ state: 'hidden' });
    await page.getByRole('button', { name: 'Concluídas', exact: true }).click();
    await heading.waitFor();
    await page.getByRole('button', { name: `Reabrir ${titulo}` }).click();
    await page.getByText('Tarefa reaberta.', { exact: true }).waitFor();

    await page.getByRole('button', { name: 'Todas', exact: true }).click();
    await page.getByRole('button', { name: `Ações de ${titulo}` }).click();
    await page.getByRole('button', { name: 'Editar', exact: true }).click();
    assert.equal(await page.getByLabel('Prazo (opcional)').inputValue(), '2025-01-01');
    await page.getByLabel('Descrição', { exact: true }).fill('Descrição revisada no cenário de teste.');
    await page.getByRole('button', { name: 'Salvar', exact: true }).click();
    await page.getByText('Tarefa atualizada.', { exact: true }).waitFor();
    await page.getByText('Descrição revisada no cenário de teste.', { exact: true }).waitFor();

    await page.getByRole('button', { name: `Ações de ${titulo}` }).click();
    await page.getByRole('button', { name: 'Excluir', exact: true }).click();
    await page.getByText('Excluir tarefa?', { exact: true }).waitFor();
    await page.getByRole('button', { name: /^(sim|confirmar|yes|confirm)$/i }).click();
    await page.getByText('Tarefa excluída.', { exact: true }).waitFor();
    await heading.waitFor({ state: 'hidden' });
  } finally {
    await browser.close();
  }
});

test('consulta e edita uma tarefa por teclado em 360 px', { timeout: 120000 }, async () => {
  const { app, username, password } = localApp();
  const browser = await chromium.launch({ channel: process.env.TASKFLOW_E2E_CHANNEL || undefined });
  try {
    const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
    await login(page, app, username, password);
    const list = page.getByRole('link', { name: 'Ver minhas tarefas' });
    await tabTo(page, list);
    await page.keyboard.press('Enter');

    const create = page.getByRole('button', { name: 'Nova tarefa', exact: true });
    await create.waitFor();
    await tabTo(page, create);
    await page.keyboard.press('Enter');

    const title = `Teclado ${randomUUID().slice(0, 12)}`;
    const titleInput = page.getByLabel('Título', { exact: true });
    const description = page.getByLabel('Descrição', { exact: true });
    const save = page.getByRole('button', { name: 'Salvar', exact: true });
    await titleInput.waitFor();
    await tabTo(page, titleInput);
    await page.keyboard.type(title);
    await tabTo(page, description);
    await page.keyboard.type('Registro sintetico.');
    await tabTo(page, save);
    await page.keyboard.press('Enter');
    await page.getByText('Tarefa criada.', { exact: true }).waitFor();

    const search = page.getByRole('searchbox', { name: 'Buscar tarefas' });
    await tabTo(page, search);
    await page.keyboard.type(title);
    const actions = page.getByRole('button', { name: `Ações de ${title}` });
    await actions.waitFor();
    await tabTo(page, actions);
    await page.keyboard.press('Enter');
    const edit = page.getByRole('button', { name: 'Editar', exact: true });
    await tabTo(page, edit);
    await page.keyboard.press('Enter');
    await description.waitFor();
    await tabTo(page, description);
    await page.keyboard.press('End');
    await page.keyboard.type(' Editado por teclado.');
    await tabTo(page, save);
    await page.keyboard.press('Enter');
    await page.getByText('Registro sintetico. Editado por teclado.', { exact: true }).waitFor();

    await tabTo(page, actions);
    await page.keyboard.press('Enter');
    const remove = page.getByRole('button', { name: 'Excluir', exact: true });
    await tabTo(page, remove);
    await page.keyboard.press('Enter');
    const confirm = page.getByRole('button', { name: /^(sim|confirmar|yes|confirm)$/i });
    await tabTo(page, confirm);
    await page.keyboard.press('Enter');
    await page.getByText('Tarefa excluída.', { exact: true }).waitFor();
  } finally {
    await browser.close();
  }
});

const recoveryMarker = process.env.TASKFLOW_RECOVERY_MARKER;
test('entra e consulta tarefa existente no banco restaurado', {
  timeout: 120000,
  skip: !recoveryMarker,
}, async () => {
  const { app, username, password } = localApp();
  const browser = await chromium.launch({ channel: process.env.TASKFLOW_E2E_CHANNEL || undefined });
  try {
    const page = await browser.newPage();
    await login(page, app, username, password);
    await page.getByRole('link', { name: /^Para hoje/ }).waitFor();
    await page.getByRole('link', { name: 'Ver minhas tarefas' }).click();
    await page.getByRole('searchbox', { name: 'Buscar tarefas' }).fill(recoveryMarker);
    await page.getByRole('heading', { name: recoveryMarker, exact: true }).waitFor();
  } finally {
    await browser.close();
  }
});
