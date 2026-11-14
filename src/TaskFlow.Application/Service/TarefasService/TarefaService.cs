using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using TaskFlow.IService;
using TaskFlow.Tarefas;
using TaskFlow.TarefasDto;
using TaskFlow.TarefaStatus;
using Volo.Abp.Application.Services;
using Volo.Abp.Authorization;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;

namespace TaskFlow.Service.TarefasService;

[Authorize]
public class TarefaService : CrudAppService<Tarefa, TarefaDto, Guid,
    TarefaConsultaDto, CreateUpdateTarefaDto>, ITarefaService
{
    public TarefaService(IRepository<Tarefa, Guid> repository) : base(repository) { }

    private Guid RequireUserId()
    {
        if (!CurrentUser.IsAuthenticated || !CurrentUser.Id.HasValue)
        {
            throw new AbpAuthorizationException();
        }
        return CurrentUser.Id.Value;
    }

    private async Task<IQueryable<Tarefa>> GetPersonalTasksAsync()
    {
        var userId = RequireUserId();
        var tenantId = CurrentTenant.Id;
        return (await Repository.GetQueryableAsync())
            .Where(tarefa => tarefa.CreatorId == userId && tarefa.TenantId == tenantId);
    }

    protected override async Task<IQueryable<Tarefa>> CreateFilteredQueryAsync(TarefaConsultaDto input)
    {
        var query = await GetPersonalTasksAsync();
        var busca = input.Busca?.Trim();
        if (!string.IsNullOrEmpty(busca))
        {
            query = query.Where(tarefa => tarefa.Titulo.Contains(busca) || tarefa.Descricao.Contains(busca));
        }

        if (input.Prioridade is { } prioridade)
        {
            query = query.Where(tarefa => tarefa.Prioridade == prioridade);
        }

        var dia = input.DataReferencia ?? DateOnly.FromDateTime(Clock.Now);
        return input.Filtro switch
        {
            TarefaFiltro.Pendentes => query.Where(tarefa => tarefa.Status == TarefasStatus.Pendente),
            TarefaFiltro.Concluidas => query.Where(tarefa => tarefa.Status == TarefasStatus.Concluída),
            TarefaFiltro.Hoje => query.Where(tarefa => tarefa.Status == TarefasStatus.Pendente && tarefa.Prazo == dia),
            TarefaFiltro.Atrasadas => query.Where(tarefa => tarefa.Status == TarefasStatus.Pendente && tarefa.Prazo < dia),
            _ => query
        };
    }

    public virtual async Task<TarefaResumoDto> GetResumoAsync(DateOnly? dataReferencia = null)
    {
        var query = await GetPersonalTasksAsync();
        var dia = dataReferencia ?? DateOnly.FromDateTime(Clock.Now);
        var counts = query.GroupBy(_ => 1).Select(tasks => new TarefaResumoDto
        {
            Pendentes = tasks.Count(t => t.Status == TarefasStatus.Pendente),
            Hoje = tasks.Count(t => t.Status == TarefasStatus.Pendente && t.Prazo == dia),
            Atrasadas = tasks.Count(t => t.Status == TarefasStatus.Pendente && t.Prazo < dia),
            Concluidas = tasks.Count(t => t.Status == TarefasStatus.Concluída)
        });
        return await AsyncExecuter.FirstOrDefaultAsync(counts) ?? new TarefaResumoDto();
    }

    public virtual async Task<TarefaDto> UpdateStatusAsync(Guid id, AtualizarTarefaStatusDto input)
    {
        await CheckUpdatePolicyAsync();
        var tarefa = await GetEntityByIdAsync(id);
        if (tarefa.Status != input.Status)
        {
            tarefa.Status = input.Status;
            await Repository.UpdateAsync(tarefa, autoSave: true);
        }

        return await MapToGetOutputDtoAsync(tarefa);
    }

    protected override async Task<Tarefa> GetEntityByIdAsync(Guid id)
    {
        var userId = RequireUserId();
        var tenantId = CurrentTenant.Id;
        var tarefa = await Repository.FindAsync(tarefa =>
            tarefa.Id == id && tarefa.CreatorId == userId && tarefa.TenantId == tenantId);
        // Do not disclose whether a task belonging to another user exists.
        return tarefa ?? throw new EntityNotFoundException(typeof(Tarefa), id);
    }

    public override Task<TarefaDto> CreateAsync(CreateUpdateTarefaDto input)
    {
        RequireUserId();
        return base.CreateAsync(input);
    }

    protected override async Task<Tarefa> MapToEntityAsync(CreateUpdateTarefaDto input)
    {
        var tarefa = await base.MapToEntityAsync(input);
        tarefa.TenantId = CurrentTenant.Id;
        tarefa.DataCriacao = Clock.Now;
        return tarefa;
    }

    public override async Task DeleteAsync(Guid id)
    {
        await CheckDeletePolicyAsync();
        // Check ownership before deletion, including calls made directly by ID.
        var tarefa = await GetEntityByIdAsync(id);
        await Repository.DeleteAsync(tarefa);
    }
}
