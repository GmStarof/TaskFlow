using System;
using System.Threading.Tasks;
using TaskFlow.TarefasDto;
using Volo.Abp.Application.Services;

namespace TaskFlow.IService;

/// <summary>Gerencia as tarefas pessoais do usuário e da organização atuais.</summary>
public interface ITarefaService :
    ICrudAppService<TarefaDto, Guid, TarefaConsultaDto, CreateUpdateTarefaDto>
{
    /// <summary>Conta tarefas pessoais usando o dia informado para classificar prazos.</summary>
    Task<TarefaResumoDto> GetResumoAsync(DateOnly? dataReferencia);

    /// <summary>Define o status da tarefa, preservando seus demais campos.</summary>
    Task<TarefaDto> UpdateStatusAsync(Guid id, AtualizarTarefaStatusDto input);
}
