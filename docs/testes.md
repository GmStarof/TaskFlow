# Estratégia de testes

| Nível | Evidência | Escopo |
|---|---|---|
| Backend | TaskFlow.EntityFrameworkCore.Tests, xUnit e SQLite em memória | Validação, operações do autor, isolamento entre usuários e organizações, busca, prazo, resumo e atualização rápida |
| Frontend | Karma e Jasmine | Estado do formulário, valores padrão e bloqueio de envio duplicado |
| Ponta a ponta | npm run test:e2e, Chrome e SQL Server de verificação | Login, visão geral, criação, busca, atraso, mudança de status, leitura do prazo na edição, exclusão e layout a 360 px |
| Operação | Migrações, sondagem HTTP e restauração | Schema SQL, inicialização, liveness, readiness e recuperação |

Os testes do backend geram IDs sintéticos e criam tarefas em memória. O template autoriza chamadas de serviço durante esses testes e as regras explícitas de acesso continuam sendo exercitadas. O cenário ponta a ponta usa a autenticação real do host. O DbMigrator fornece dados iniciais de identidade e OAuth. O teste de navegador cria uma tarefa identificada por UUID e exclui esse registro no fluxo de sucesso. Reserve uma base descartável para as tentativas interrompidas.

```powershell
dotnet test test/TaskFlow.EntityFrameworkCore.Tests --collect 'Code Coverage;Format=Cobertura'
cd angular
npm ci
npm test -- --watch=false --browsers=ChromeHeadless --code-coverage
```

Para o cenário de navegador, suba a interface e a API com uma base de verificação já migrada. Por padrão o teste abre http://localhost:4200. Use TASKFLOW_E2E_URL para outra URL local e forneça TASKFLOW_E2E_USER e TASKFLOW_E2E_PASSWORD pelo ambiente. Defina TASKFLOW_E2E_CHANNEL=chrome para usar o Chrome instalado ou execute npx playwright install chromium para usar Chromium.

```powershell
cd angular
npm run test:e2e
```

A cobertura Angular fica em angular/coverage e a cobertura do backend em TestResults. Os relatórios medem trechos exercitados pelas suítes. Execute a coleta ao alterar casos de uso e compare cobertura por área, com atenção às regras de acesso e aos fluxos críticos.

O teste de recuperação do navegador roda quando TASKFLOW_RECOVERY_MARKER contém o título de uma tarefa de verificação gravada antes do backup e visível para o usuário do teste. Inicie a API com a cópia restaurada antes de executá-lo.

## Teste de carga

Prepare o banco LocalDB TaskFlow_Carga com o DbMigrator. Inicie a API local apontando para essa base e com o cliente TaskFlow_App habilitado para o fluxo de senha do ambiente de desenvolvimento. O gerador usa Node.js 22, sqlcmd e apenas contas e tarefas sintéticas. Use uma base de verificação dedicada, pois cada execução cria novas contas e 10.000 tarefas.

```powershell
node tools/load-test.mjs
```

Por padrão, o gerador acessa http://localhost:5000. A saída agregada fica em .tools/load-test/resultado.json. Consulte as [evidências da entrega](verificacao.md).
