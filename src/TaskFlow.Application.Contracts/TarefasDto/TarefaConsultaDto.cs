using System;
using System.ComponentModel.DataAnnotations;
using TaskFlow.TarefaStatus;
using Volo.Abp.Application.Dtos;

namespace TaskFlow.TarefasDto;

public enum TarefaFiltro
{
    Todas,
    Pendentes,
    Hoje,
    Atrasadas,
    Concluidas
}

public class TarefaConsultaDto : PagedAndSortedResultRequestDto
{
    [StringLength(200)]
    public string? Busca { get; set; }

    [EnumDataType(typeof(TarefaFiltro))]
    public TarefaFiltro Filtro { get; set; }

    [EnumDataType(typeof(TarefaPrioridade))]
    public TarefaPrioridade? Prioridade { get; set; }

    public DateOnly? DataReferencia { get; set; }
}

public class TarefaResumoDto
{
    public int Pendentes { get; set; }
    public int Hoje { get; set; }
    public int Atrasadas { get; set; }
    public int Concluidas { get; set; }
}

public class AtualizarTarefaStatusDto
{
    [EnumDataType(typeof(TarefasStatus))]
    public required TarefasStatus Status { get; set; }
}
