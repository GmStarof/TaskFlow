# Implantação e operação

## Topologia e entrega

O Compose de desenvolvimento reúne SQL Server, migrador, API e Nginx com Angular. As portas ficam limitadas ao computador local. O banco persiste no volume nomeado data. O migrador espera o banco responder e a API depende da sua conclusão bem-sucedida.

O workflow TaskFlow CI executa restauração, compilação, lint, testes, cobertura e empacotamento. A etapa de entrega publica os binários, sobe o Compose em um runner descartável, verifica a prontidão e roda o teste de navegador. O resultado inclui os relatórios e pacotes para revisão. Publique as imagens e aplique a versão aprovada pelo processo do ambiente. Conserve o identificador do commit e das imagens junto ao registro de implantação.

Para um ambiente compartilhado, prepare SQL Server persistente com usuário próprio, HTTPS, certificados OpenIddict, Data Protection persistente e backup. Configure as URLs públicas antes do seed inicial. Em bancos existentes, sincronize os clientes OpenIddict quando mudar URLs registradas. Sirva o Angular com fallback para index.html nas rotas de aplicação. O endpoint /getEnvConfig deve fornecer a configuração pública correta, com issuer, redirectUri e URLs da API. Consulte o README para a configuração local do Compose.

| Variável | Componente | Uso |
|---|---|---|
| TASKFLOW_DB_PASSWORD | Compose local | Senha do SQL Server local. Preencher em .env |
| ConnectionStrings__Default | Host e migrador | Conexão SQL Server fornecida pelo ambiente |
| App__SelfUrl | Host | URL pública da API |
| App__AngularUrl | Host | URL pública da interface |
| App__CorsOrigins | Host | Origens separadas por vírgula |
| App__RedirectAllowedUrls | Host | URLs autorizadas de redirecionamento |
| AuthServer__Authority | Host | Emissor do OpenIddict |
| AuthServer__RequireHttpsMetadata | Host | Exigência HTTPS, padrão verdadeiro |
| AuthServer__CertificatePath | Host | Caminho do certificado PFX no ambiente compartilhado |
| AuthServer__CertificatePassword | Host | Senha do certificado, fornecida como segredo |
| StringEncryption__DefaultPassPhrase | Host e processos que usam a mesma cifra | Segredo de criptografia de configurações |
| OpenIddict__Applications__TaskFlow_App__RootUrl | Migrador | URL base cadastrada para o cliente Angular |
| OpenIddict__Applications__TaskFlow_Swagger__RootUrl | Migrador | URL base cadastrada para o cliente Swagger |

## Runbook

| Situação | Procedimento |
|---|---|
| Subir ambiente local | Restaurar dependências e publicar os dois projetos .NET conforme README. Executar `docker compose --profile app up --build -d`. |
| Inspecionar | Executar `docker compose --profile app ps -a` e `docker compose logs --tail=100 db migrator backend frontend`. Checar healthz e readyz. |
| Parar | Executar `docker compose --profile app stop`. O volume mantém os dados. |
| Reiniciar com o mesmo pacote | Executar `docker compose --profile app restart backend frontend`. Conferir prontidão e login. Uma única réplica pode gerar indisponibilidade durante o reinício. |
| Atualizar | Confirmar o backup restaurável, preparar as imagens da nova versão, executar o migrador, aguardar sucesso e promover API e frontend. Verificar prontidão e fluxo principal após a mudança. |
| Reverter versão | Escolher imagens da versão anterior e avaliar compatibilidade do schema. Se precisar reverter schema, testar a operação em cópia e planejar a preservação de dados novos. |
| Recuperar banco | Restaurar o backup em destino isolado, executar DBCC CHECKDB, conferir schema e dados e apontar uma instância de verificação para o banco restaurado. Depois de aceitar o teste, planejar a mudança da produção. |

O rollback de prioridade e prazo remove essas colunas. Prefira voltar o binário somente se a versão anterior tolerar o schema atual. Uma restauração ou reversão destrutiva exige decidir o destino das alterações feitas após o backup.

Exemplo para um SQL Server de verificação. O diretório do backup deve existir e ser gravável pelo serviço SQL.

```sql
BACKUP DATABASE [TaskFlow_Verificacao]
TO DISK = N'C:\Backups\TaskFlow_Verificacao.bak'
WITH COPY_ONLY, CHECKSUM;

RESTORE VERIFYONLY
FROM DISK = N'C:\Backups\TaskFlow_Verificacao.bak'
WITH CHECKSUM;

RESTORE FILELISTONLY
FROM DISK = N'C:\Backups\TaskFlow_Verificacao.bak';
```

Use os nomes lógicos de FILELISTONLY para restaurar em outro banco com `RESTORE DATABASE ... WITH MOVE ...`. Registre horários, versão restaurada, resultado de DBCC CHECKDB e verificação de login, lista e migrações. Mantenha backups separados da máquina principal, com acesso restrito. A frequência deve atender ao RPO definido.

| Sintoma | Causa provável | Ação |
|---|---|---|
| Interface não conecta à API | API parada, origem incorreta ou certificado local não confiável | Conferir URL, CORS e configuração HTTPS. Para Compose local, conferir dynamic-env.docker.json |
| Login retorna erro de redirect_uri | Cliente OpenIddict diverge da URL usada | Conferir origem e redirect registrado para TaskFlow_App |
| Login sem estilo | Bibliotecas web ABP ausentes | Restaurar com abp install-libs e republicar API |
| readyz responde 503 | Banco indisponível ou schema/credenciais incompatíveis | Conferir serviços SQL, conexão e saída do migrador |
| Migração falha | Conexão, bloqueio ou permissão DDL | Ler erro do migrador, confirmar versão e permissões e testar em cópia antes de repetir |
| Tarefa antiga não aparece | Autor ausente ou contexto diferente | Conferir auditoria e organização com acesso administrativo autorizado |

## Observabilidade

| Sinal | Medição | Alerta inicial |
|---|---|---|
| Processo ativo | GET /healthz, HTTP 200 indica que o host responde | Três falhas consecutivas |
| API pronta | GET /readyz confirma acesso ao banco com consulta de identidade, HTTP 503 em falha | Três falhas consecutivas |
| Disponibilidade | Proporção de sondagens autenticadas de leitura bem-sucedidas no mês | Consumo acelerado da margem de 0,5% |
| Latência | p95 de listagem e resumo, por janela e rota | Acima de 500 ms por 15 min, com amostra suficiente |
| Erros | Proporção de HTTP 5xx por rota | Acima de 1% por 5 min, com amostra suficiente |
| Backups | Idade do último backup e resultado da última restauração | Mais de 24 h sem backup ou verificação falhou |

Configure sondagens e agregação dos logs em ferramenta do ambiente. Para um painel Grafana ou Datadog, use séries de disponibilidade, volume, latência, erros e idade de backup. Os endpoints dão indicação de saúde. A medição das metas exige instrumentação e observação ao longo do tempo.
