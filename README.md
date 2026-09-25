# TaskFlow

Aplicação web de tarefas pessoais com Angular 17, ASP.NET Core/.NET 8, ABP 8.2.2 e SQL Server.

## Funcionalidades

- Criar, listar, editar e excluir tarefas pessoais.
- Status pendente ou concluída, título e descrição.
- Data de criação gerada pelo servidor e preservada na edição.
- Autenticação obrigatória na API; acesso restrito ao autor e à organização atual.
- Administração de identidade e organizações pelos módulos ABP.

Qualquer usuário autenticado pode gerenciar suas próprias tarefas. A administração do ABP não concede acesso às tarefas de outras pessoas. Compartilhamento, equipes e permissões específicas por operação ainda não fazem parte deste fluxo.

## Estrutura

- `angular`: interface e proxies da API.
- `src/TaskFlow.Domain`: entidades.
- `src/TaskFlow.Application.Contracts`: contratos e validação de entrada.
- `src/TaskFlow.Application`: serviços e regras de acesso.
- `src/TaskFlow.EntityFrameworkCore`: persistência e migrações.
- `src/TaskFlow.HttpApi.Host`: API, autenticação e Swagger.
- `src/TaskFlow.DbMigrator`: migrações e dados iniciais.
- `test`: testes .NET; testes Angular junto aos componentes.

## Executar localmente

Pré-requisitos: SDK e runtime .NET 8, Node 18 ou 20 para a base Angular atual, npm, Yarn para a restauração de bibliotecas ABP e SQL Server (LocalDB no Windows ou servidor/container). Instale a CLI ABP compatível com a solução para restaurar os recursos estáticos da tela de login.

Na raiz:

```powershell
dotnet restore TaskFlow.sln
dotnet tool install --global Volo.Abp.Cli --version 8.2.2
abp install-libs
dotnet dev-certs https --trust
```

Configure a conexão nos projetos Host e DbMigrator ou pela variável `ConnectionStrings__Default`. O padrão usa `(LocalDb)\MSSQLLocalDB`, banco `TaskFlow`. Não registre senhas reais nos arquivos versionados.

Em uma base existente, faça backup e leia as observações de migração abaixo antes de executar:

```powershell
cd src/TaskFlow.DbMigrator
dotnet run
```

Em outro terminal, inicie a API a partir de sua pasta:

```powershell
cd src/TaskFlow.HttpApi.Host
dotnet run
```

E a interface:

```powershell
cd angular
npm ci
npm start
```

Interface: `http://localhost:4200`. API/Swagger: `https://localhost:44342/swagger`.
O seed inicial usa as credenciais de desenvolvimento definidas em `TaskFlowConsts`; troque a senha inicial antes de qualquer uso compartilhado.

## Docker para desenvolvimento local

O Compose usa portas vinculadas apenas a `127.0.0.1`. O perfil `app` usa HTTP e ambiente Development; não é uma configuração de produção.

1. Copie `.env.example` para `.env` e defina `TASKFLOW_DB_PASSWORD` com uma senha forte compatível com SQL Server. Evite ponto e vírgula, pois ela também compõe a connection string.
2. Para iniciar apenas o banco: `docker compose up -d db`.
3. Para a aplicação completa, restaure os recursos estáticos com `abp install-libs`, publique os projetos .NET e inicie o perfil:

```powershell
dotnet publish src/TaskFlow.HttpApi.Host -c Release
dotnet publish src/TaskFlow.DbMigrator -c Release
docker compose --profile app up --build
```

Os Dockerfiles .NET consomem o diretório `bin/Release/net8.0/publish`; a interface é compilada na imagem com `npm ci`. O migrador aguarda o banco e a API aguarda a migração terminar.

Interface: `http://localhost:4200`; API: `http://localhost:5000`. A configuração OAuth específica é montada a partir de `angular/dynamic-env.docker.json`.

O banco usa o volume nomeado `data`. Se você já utilizava a antiga pasta `./data`, os dados não serão copiados automaticamente para o novo volume: faça uma migração/restore explícito antes de trocar de ambiente.

## Migração das tarefas existentes

`IsolatePersonalTasks`:

- Renomeia `Books` para `Tarefas`, preservando registros e IDs.
- Acrescenta `TenantId` e índice composto por organização e autor.
- Preenche a organização a partir de `AbpUsers` quando o autor está disponível.
- Preserva as datas de criação existentes.

Tarefas sem `CreatorId` permanecem no banco, mas ficam invisíveis na API. Não atribuímos esses registros automaticamente a nenhum usuário. Faça inventário e atribuição explícita caso precise recuperá-los. Registros cujo autor tenha sido removido também precisam de revisão.

Clientes de criação/edição não devem mais enviar `dataCriacao`; o campo continua presente na resposta. A atualização do backend, frontend e schema deve ocorrer em conjunto.

O rollback remove o campo de organização: antes de usá-lo, avalie os dados criados após a migração.

## Produção

Configure URLs reais, HTTPS, connection string e certificados fora do código. O Host exige `AuthServer__CertificatePassword` fora de Development e aceita `AuthServer__CertificatePath` para o arquivo PFX.

A passphrase em `StringEncryption` ainda é um valor legado de desenvolvimento. Substitua-a por um segredo de ambiente antes da primeira implantação real; para uma base que já contenha valores cifrados, planeje a rotação para não perder a capacidade de lê-los. Nunca use o Compose de desenvolvimento como implantação pública.

## Verificação

```powershell
dotnet build TaskFlow.sln
dotnet test test/TaskFlow.EntityFrameworkCore.Tests/TaskFlow.EntityFrameworkCore.Tests.csproj
cd angular
npm run lint
npm test -- --watch=false --browsers=ChromeHeadless
npm run build:prod
```

Os testes .NET usam SQLite em memória e não alteram seu SQL Server. Cobrem operações do autor, acesso de terceiros, isolamento por organização, acesso anônimo e validação de entrada. O template de testes ABP permite autorização globalmente; os casos de acesso anônimo exercitam também a proteção explícita no serviço. Uma validação HTTP/OAuth completa continua necessária antes de implantação.

Os testes Angular cobrem criação após edição, status pendente, campos em branco e prevenção de envio duplicado.
