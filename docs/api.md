# API de tarefas

O Swagger é disponibilizado em /swagger e o contrato gerado em /swagger/v1/swagger.json. A especificação inclui os módulos do ABP servidos pelo host. O arquivo [openapi.json](openapi.json) contém o recorte gerado das operações de tarefas. Para capturar a especificação completa do ambiente local, execute o comando abaixo.

```powershell
Invoke-WebRequest 'https://localhost:44342/swagger/v1/swagger.json' -OutFile openapi-completo.json
```

A API valida um token do OpenIddict e filtra tarefas por autor e organização. O frontend usa Authorization Code com PKCE e cliente TaskFlow_App. O Swagger usa o próprio cliente configurado no seed.

| Método | Rota | Resultado |
|---|---|---|
| GET | /api/app/tarefa | Lista paginada e total filtrado |
| GET | /api/app/tarefa/{id} | Tarefa pessoal |
| POST | /api/app/tarefa | Cria tarefa e retorna seus dados |
| PUT | /api/app/tarefa/{id} | Atualiza campos editáveis |
| PUT | /api/app/tarefa/{id}/status | Atualiza só o status |
| DELETE | /api/app/tarefa/{id} | Exclui tarefa pessoal |
| GET | /api/app/tarefa/resumo | Contadores pessoais |

A listagem aceita skipCount, maxResultCount, sorting, busca, filtro, prioridade e dataReferencia. Em filtro, 0 é todas, 1 pendentes, 2 hoje, 3 atrasadas e 4 concluídas. O cliente web envia dataReferencia no formato AAAA-MM-DD. Se estiver ausente, o servidor usa seu dia atual. A busca respeita a comparação de texto configurada no banco.

Exemplo de criação ou atualização.

```json
{
  "titulo": "Revisar planejamento",
  "descricao": "Conferir as próximas entregas",
  "status": 0,
  "prioridade": 2,
  "prazo": "2026-11-20"
}
```

Prazo nulo ou omitido indica ausência de prazo. Prioridade omitida usa normal. Na alteração rápida, envie somente o valor desejado, como `{"status":1}`.

| HTTP | Quando ocorre |
|---|---|
| 400 | Campo obrigatório, valor fora do domínio, prazo inválido ou parâmetros de paginação inválidos |
| 401 | Sessão ou token ausente ou inválido |
| 403 | Operação bloqueada por autorização |
| 404 | Tarefa inexistente ou indisponível ao usuário naquele contexto |
| 409 | Conflito de concorrência detectado pelo EF Core e convertido pelo ABP |

O corpo de erro segue o formato do ABP. A API expõe os dados de auditoria do DTO de leitura. Título, descrição, status, prioridade e prazo são entradas editáveis. Autor, organização e data de criação são controlados pelo servidor.
