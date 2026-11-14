using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Shouldly;
using TaskFlow.IService;
using TaskFlow.Tarefas;
using TaskFlow.TarefasDto;
using TaskFlow.TarefaStatus;
using Volo.Abp.Authorization;
using Volo.Abp.Domain.Entities;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.MultiTenancy;
using Volo.Abp.Security.Claims;
using Volo.Abp.Validation;
using Volo.Abp.Timing;
using Xunit;

namespace TaskFlow.EntityFrameworkCore.Applications;

[Collection(TaskFlowTestConsts.CollectionDefinitionName)]
public class TarefaServiceTests : TaskFlowEntityFrameworkCoreTestBase
{
    private readonly ITarefaService _service;
    private readonly ICurrentPrincipalAccessor _principal;
    private readonly ICurrentTenant _tenant;

    public TarefaServiceTests()
    {
        _service = GetRequiredService<ITarefaService>();
        _principal = GetRequiredService<ICurrentPrincipalAccessor>();
        _tenant = GetRequiredService<ICurrentTenant>();
    }

    private IDisposable Login(Guid userId) => _principal.Change(new ClaimsPrincipal(
        new ClaimsIdentity(new[] { new Claim(AbpClaimTypes.UserId, userId.ToString()) }, "Test")));

    private static CreateUpdateTarefaDto Input() => new()
    {
        Titulo = "Minha tarefa",
        Descricao = "Descrição da tarefa",
        Status = TarefasStatus.Pendente
    };

    [Fact]
    public async Task Owner_Can_Create_Read_Update_And_Delete()
    {
        var userId = Guid.NewGuid();
        using var login = Login(userId);
        var before = GetRequiredService<IClock>().Now.AddSeconds(-1);
        var created = await _service.CreateAsync(Input());
        created.CreatorId.ShouldBe(userId);
        created.DataCriacao.ShouldBeGreaterThan(before);
        (await _service.GetAsync(created.Id)).Titulo.ShouldBe("Minha tarefa");

        var input = Input();
        input.Status = TarefasStatus.Concluída;
        var updated = await _service.UpdateAsync(created.Id, input);
        updated.Status.ShouldBe(TarefasStatus.Concluída);
        updated.DataCriacao.ShouldBe(created.DataCriacao);

        await _service.DeleteAsync(created.Id);
        await Should.ThrowAsync<EntityNotFoundException>(() => _service.GetAsync(created.Id));
    }

    [Fact]
    public async Task Other_User_Cannot_List_Read_Update_Or_Delete()
    {
        TarefaDto created;
        using (Login(Guid.NewGuid()))
        {
            created = await _service.CreateAsync(Input());
        }

        using var login = Login(Guid.NewGuid());
        var own = await _service.CreateAsync(Input());
        var list = await _service.GetListAsync(new TarefaConsultaDto());
        list.TotalCount.ShouldBe(1);
        list.Items[0].Id.ShouldBe(own.Id);
        await Should.ThrowAsync<EntityNotFoundException>(() => _service.GetAsync(created.Id));
        await Should.ThrowAsync<EntityNotFoundException>(() => _service.UpdateAsync(created.Id, Input()));
        await Should.ThrowAsync<EntityNotFoundException>(() => _service.DeleteAsync(created.Id));
    }

    [Fact]
    public async Task Same_User_Cannot_Access_Tasks_From_Another_Tenant()
    {
        using var login = Login(Guid.NewGuid());
        TarefaDto created;
        using (_tenant.Change(Guid.NewGuid()))
        {
            created = await _service.CreateAsync(Input());
        }

        using var host = _tenant.Change(null);
        (await _service.GetListAsync(new TarefaConsultaDto())).TotalCount.ShouldBe(0);
        await Should.ThrowAsync<EntityNotFoundException>(() => _service.GetAsync(created.Id));
        await Should.ThrowAsync<EntityNotFoundException>(() => _service.UpdateAsync(created.Id, Input()));
        await Should.ThrowAsync<EntityNotFoundException>(() => _service.DeleteAsync(created.Id));
    }

    [Fact]
    public async Task Anonymous_User_Cannot_Use_Any_Task_Operation()
    {
        using var anonymous = _principal.Change(new ClaimsPrincipal(new ClaimsIdentity()));
        // The test template bypasses ABP authorization; these assertions also exercise
        // the explicit authenticated-owner checks in the application service.
        await Should.ThrowAsync<AbpAuthorizationException>(() => _service.CreateAsync(Input()));
        await Should.ThrowAsync<AbpAuthorizationException>(() => _service.GetListAsync(new TarefaConsultaDto()));
        await Should.ThrowAsync<AbpAuthorizationException>(() => _service.GetAsync(Guid.NewGuid()));
        await Should.ThrowAsync<AbpAuthorizationException>(() => _service.UpdateAsync(Guid.NewGuid(), Input()));
        await Should.ThrowAsync<AbpAuthorizationException>(() => _service.DeleteAsync(Guid.NewGuid()));
    }

    [Theory]
    [InlineData("", "Descrição", 0)]
    [InlineData("   ", "Descrição", 0)]
    [InlineData("Título", "   ", 0)]
    [InlineData("Título", "Descrição", 42)]
    public async Task Invalid_Input_Is_Rejected(string title, string description, int status)
    {
        using var login = Login(Guid.NewGuid());
        await Should.ThrowAsync<AbpValidationException>(() => _service.CreateAsync(new CreateUpdateTarefaDto
        {
            Titulo = title,
            Descricao = description,
            Status = (TarefasStatus)status
        }));
    }

    [Fact]
    public async Task Search_Filters_And_Summary_Use_The_Same_Owner_And_Date()
    {
        var today = new DateOnly(2026, 11, 14);
        var input = Input();
        input.Titulo = "Planejar revisão";
        input.Prioridade = TarefaPrioridade.Alta;
        input.Prazo = today.AddDays(-1);
        using (Login(Guid.NewGuid()))
        {
            await _service.CreateAsync(input);
        }

        using var login = Login(Guid.NewGuid());
        var overdue = await _service.CreateAsync(input);
        input.Prazo = today;
        await _service.CreateAsync(input);
        input.Status = TarefasStatus.Concluída;
        input.Prazo = today.AddDays(-1);
        await _service.CreateAsync(input);
        input.Status = TarefasStatus.Pendente;
        input.Prazo = null;
        await _service.CreateAsync(input);

        var results = await _service.GetListAsync(new TarefaConsultaDto
        {
            Busca = " revisão ", Filtro = TarefaFiltro.Atrasadas,
            Prioridade = TarefaPrioridade.Alta, DataReferencia = today
        });
        results.TotalCount.ShouldBe(1);
        results.Items[0].Id.ShouldBe(overdue.Id);

        var summary = await _service.GetResumoAsync(today);
        summary.Pendentes.ShouldBe(3);
        summary.Hoje.ShouldBe(1);
        summary.Atrasadas.ShouldBe(1);
        summary.Concluidas.ShouldBe(1);
    }

    [Fact]
    public async Task Quick_Status_Update_Preserves_Details_And_Requires_Ownership()
    {
        var owner = Guid.NewGuid();
        TarefaDto created;
        using (Login(owner))
        {
            var input = Input();
            input.Prazo = new DateOnly(2026, 11, 14);
            input.Prioridade = TarefaPrioridade.Alta;
            created = await _service.CreateAsync(input);
        }

        var status = new AtualizarTarefaStatusDto { Status = TarefasStatus.Concluída };
        using (Login(Guid.NewGuid()))
        {
            await Should.ThrowAsync<EntityNotFoundException>(() => _service.UpdateStatusAsync(created.Id, status));
        }

        using var login = Login(owner);
        await _service.UpdateStatusAsync(created.Id, status);
        var repeated = await _service.UpdateStatusAsync(created.Id, status);
        repeated.Status.ShouldBe(TarefasStatus.Concluída);
        repeated.Titulo.ShouldBe(created.Titulo);
        repeated.Prazo.ShouldBe(created.Prazo);
        repeated.Prioridade.ShouldBe(created.Prioridade);
        repeated.DataCriacao.ShouldBe(created.DataCriacao);
    }

    [Fact]
    public async Task Oversized_Input_Is_Rejected()
    {
        using var login = Login(Guid.NewGuid());
        var input = Input();
        input.Titulo = new string('a', 201);
        await Should.ThrowAsync<AbpValidationException>(() => _service.CreateAsync(input));
        input = Input();
        input.Descricao = new string('a', 4001);
        await Should.ThrowAsync<AbpValidationException>(() => _service.CreateAsync(input));
    }
}
