# Evidências de verificação

Verificação local de 14 de novembro de 2026 em Windows, SQL Server LocalDB, .NET com destino net8.0 e Chrome Headless. Os testes de persistência usaram SQLite em memória. O cenário de navegador usou a base isolada TaskFlow_Verificacao no SQL Server.

| Verificação | Resultado local |
|---|---|
| Compilação .NET | Aprovada |
| Compilação Angular de produção e lint | Aprovados |
| Integração backend | 14 testes aprovados. Inclui filtros, isolamento, contadores e alteração idempotente de status |
| Testes Angular | 4 testes aprovados |
| Cenário de navegador | Aprovado em LocalDB e em instalação limpa via Compose. Login, resumo, criação, busca, filtros, recuperação após erro de consulta, conclusão, reabertura, edição e exclusão em 360 px |
| Migrações SQL | Base de verificação criada com cinco migrações. EF Core sem alterações pendentes |
| Prontidão e processo ativo | GET /readyz e GET /healthz retornaram HTTP 200 com Healthy |
| Indisponibilidade e recuperação | Com o banco do Compose parado, /healthz continuou em 200 e /readyz retornou 503. Após o reinício do banco, /readyz voltou a 200 |
| OpenAPI | Exportado do Swagger. As quatro rotas do módulo abrangem sete operações |
| Recuperação | BACKUP com checksum, RESTORE VERIFYONLY, restauração em TaskFlow_Restaurado e DBCC CHECKDB concluídos. Histórico das cinco migrações conferido. O exercício SQL local levou cerca de 0,4 s |
| Compose | Configuração resolvida e ambiente criado com nome e volume isolados. Migrador saiu com código 0 e a API ficou pronta |
| Workflow | Compilação, testes e entrega em ambiente descartável acompanhados no [GitHub Actions do repositório](https://github.com/GmStarof/TaskFlow/actions) |

A cobertura de linhas da suíte .NET no módulo TaskFlow.Application foi de 92,55%. A cobertura de linhas dos testes Angular foi de 48,14%. Os denominadores e níveis de instrumentação das duas medições são diferentes. O cenário de navegador é uma verificação separada e não foi contabilizado nessas porcentagens.

## Validação para a versão 1.0.0

### Carga autenticada

Execução local em Windows com API .NET 8 compilada em Release e configurada em Development, SQL Server LocalDB e gerador Node.js 22.20.0 na mesma máquina. Hardware com Ryzen 5 9600X, 12 processadores lógicos e aproximadamente 31 GiB de RAM utilizável.

Foram usadas 10 sessões autenticadas com 1.000 tarefas sintéticas por usuário. O teste confirmou o volume por usuário nas duas rotas, aqueceu por 30 segundos e mediu por 300 segundos. Cada sessão alternou listagem paginada de 10 itens e resumo, com intervalo alvo de 200 ms por requisição. Os tempos incluem leitura e interpretação da resposta pelo cliente. Os percentis consideram requisições bem-sucedidas.

| Rota | Amostras | p50 | p95 | p99 | Erros |
|---|---:|---:|---:|---:|---:|
| Listagem | 7.397 | 9,31 ms | 11,10 ms | 15,93 ms | 0 |
| Resumo | 7.397 | 5,46 ms | 6,70 ms | 9,69 ms | 0 |

O p95 ficou abaixo dos 500 ms definidos no RNF-02 no cenário local. Foram 14.794 requisições, aproximadamente 49,3 por segundo, com taxa de erro de 0%.

### Teclado e recuperação

- **RF-09.** O cenário de Chrome Headless a 360 px abriu a lista, criou, pesquisou, editou e excluiu uma tarefa usando Tab, Enter e digitação após autenticação. O teste faz parte de `npm run test:e2e`.
- **RNF-04.** O backup com checksum passou em RESTORE VERIFYONLY. A cópia restaurada continha 10.001 tarefas e passou em DBCC CHECKDB. A API apontou para essa cópia e respondeu 200 em /readyz. No navegador, o usuário entrou e encontrou a tarefa gravada antes do backup.
- A restauração e a checagem SQL levaram 0,35 s. A janela entre o início da restauração e a conclusão da suíte de navegador foi de 74,37 s. Esse intervalo inclui a inicialização e a execução dos cenários de verificação.

A disponibilidade mensal, o RPO baseado na frequência real de backups e os resultados em ambiente compartilhado dependem da operação e da janela de observação.

A auditoria npm de dependências de produção registrou 29 alertas, sendo 7 altos, 21 moderados e 1 baixo. A preparação para implantação pública inclui revisar o impacto dos alertas e o plano de atualização das dependências.
