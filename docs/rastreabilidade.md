# Matriz de rastreabilidade

| Necessidade | Requisito e regra | Componente | Teste ou verificação |
|---|---|---|---|
| Entrar e acessar dados próprios | RF-01, RF-03, RN-01 | OpenIddict, guarda de rota, TarefaService | Cenário E2E e testes Anonymous_User, Other_User e Same_User |
| Registrar e editar tarefas | RF-02, RN-02 e RN-03 | Formulário Angular e CreateUpdateTarefaDto | Owner_Can_Create_Read_Update_And_Delete, Invalid_Input e testes de formulário |
| Excluir tarefa | RF-04, RN-06 | TarefaComponent e DeleteAsync | Teste do autor e confirmação no cenário E2E |
| Localizar tarefa | RF-05, RN-07 | TarefaConsultaDto e CreateFilteredQueryAsync | Search_Filters_And_Summary e filtro no cenário E2E |
| Organizar por prazo e prioridade | RF-06, RN-04 | Tarefa, migração e formulário | Search_Filters_And_Summary, migração SQL e data no cenário E2E |
| Alterar status rapidamente | RF-07, RN-05 | UpdateStatusAsync e lista Angular | Quick_Status_Update e cenário E2E |
| Acompanhar pendências | RF-08, RN-04 e RN-07 | GetResumoAsync e HomeComponent | Search_Filters_And_Summary e abertura da visão geral no cenário E2E |
| Usar em tela pequena | RF-09 | WorkspaceComponent e lista | Cenário E2E de criação, busca, edição e exclusão por teclado a 360 px |
| Proteger acesso | RNF-01, RN-01 | Host, SQL Server e serviço | Testes de isolamento, login E2E e conferência de configuração de implantação |
| Acompanhar latência e disponibilidade | RNF-02 e RNF-03 | API e sondagens | Teste de carga local concluído. Disponibilidade mensal depende de monitoramento do ambiente alvo |
| Recuperar dados | RNF-04 | SQL Server e runbook | Backup, restauração, integridade, login e consulta por navegador comprovados em base de teste |
| Reproduzir verificações | RNF-05 | Workflow de CI e documentação | Resultados anexados pelo workflow |
| Limitar exposição de dados | RNF-06 | Isolamento, logs e infraestrutura | Revisão dos controles e definição de retenção pelo responsável pela operação |
