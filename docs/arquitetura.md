# Arquitetura do TaskFlow

ASP.NET Core e ABP formam um monólito em camadas. O host expõe REST e integra o servidor de identidade OpenIddict. O Angular é entregue separadamente como arquivos estáticos. O SQL Server contém as tarefas e os dados de identidade, auditoria e configuração. O console DbMigrator aplica migrações e inicializa os dados antes de disponibilizar o host.

## Contexto e contêineres

```mermaid
flowchart LR
    U[Usuário] --> S[TaskFlow]
    A[Administrador] --> S
    S --> D[(Ambiente SQL Server)]
```

```mermaid
flowchart LR
    B[Navegador] --> W[Angular em servidor estático]
    B -->|REST e OAuth 2.0| H[Host ASP.NET Core e OpenIddict]
    H --> Q[(SQL Server)]
    M[Console DbMigrator] -->|Migração e seed| Q
```

## Componentes e código

```mermaid
flowchart TD
    P[TarefaComponent e HomeComponent] --> C[Proxy Angular TarefaService]
    C --> H[Host HTTP e controladores convencionais ABP]
    H --> K[ITarefaService e DTOs]
    K --> S[TarefaService]
    S --> R[IRepository de Tarefa]
    R --> E[TaskFlowDbContext e EF Core]
    E --> T[(Tabela Tarefas)]
    S --> A[Contexto de usuário e organização]
```

| Projeto | Responsabilidade |
|---|---|
| Angular | Navegação, formulário, filtros, paginação, feedback e OAuth |
| Application.Contracts | Contratos de leitura e escrita e validações |
| Application | Casos de uso, consultas e regras de acesso |
| Domain e Domain.Shared | Agregado Tarefa, enumerações e componentes de domínio |
| EntityFrameworkCore | SQL Server, mapeamentos e migrações |
| HttpApi e HttpApi.Host | HTTP, OpenAPI, OpenIddict e health checks |
| DbMigrator | Schema e dados iniciais |

O módulo de tarefas usa os controladores convencionais do ABP. Isso reduz duplicação entre serviço e camada HTTP. A busca e a paginação ficam no servidor para preservar o escopo de dados e calcular totais sobre a consulta filtrada. O endpoint de status recebe o estado desejado e preserva os demais campos da tarefa.

## Sequência de atualização rápida

```mermaid
sequenceDiagram
    actor U as Usuário
    participant W as Angular
    participant H as Host e OpenIddict
    participant S as Serviço de tarefas
    participant D as SQL Server
    U->>W: Concluir tarefa
    W->>H: PUT com ID e status desejado
    H->>H: Validar token e entrada
    H->>S: UpdateStatusAsync
    S->>D: Consultar ID, autor e organização
    alt Tarefa disponível
        S->>D: Persistir status se mudou
        S-->>W: 200 com tarefa atualizada
        W-->>U: Mostrar confirmação e recarregar lista
    else Tarefa indisponível
        S-->>W: 404
        W-->>U: Informar falha
    end
```

```mermaid
stateDiagram-v2
    [*] --> Pendente
    [*] --> Concluida
    Pendente --> Concluida: concluir
    Concluida --> Pendente: reabrir
    Pendente --> [*]: excluir
    Concluida --> [*]: excluir
```

Hoje e atrasada são condições calculadas a partir do prazo. A API usa OAuth 2.0 e OpenID Connect com Authorization Code e PKCE. O ABP aplica papéis e permissões aos módulos administrativos. Tarefas têm controle por autor e organização. Mensageria, GraphQL e gRPC ficam fora deste desenho porque os casos de uso funcionam com chamadas REST síncronas.
