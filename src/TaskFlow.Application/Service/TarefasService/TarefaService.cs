using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using TaskFlow.IService;
using TaskFlow.Tarefas;
using TaskFlow.TarefasDto;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Authorization;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;

namespace TaskFlow.Service.TarefasService;

[Authorize]
public class TarefaService : CrudAppService<Tarefa, TarefaDto, Guid,
    PagedAndSortedResultRequestDto, CreateUpdateTarefaDto>, ITarefaService
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

    protected override async Task<IQueryable<Tarefa>> CreateFilteredQueryAsync(PagedAndSortedResultRequestDto input)
    {
        var userId = RequireUserId();
        var tenantId = CurrentTenant.Id;
        return (await Repository.GetQueryableAsync())
            .Where(tarefa => tarefa.CreatorId == userId && tarefa.TenantId == tenantId);
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
