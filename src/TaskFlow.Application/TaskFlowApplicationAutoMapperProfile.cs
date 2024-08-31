using AutoMapper;
using TaskFlow.Tarefas;
using TaskFlow.TarefasDto;

namespace TaskFlow;

public class TaskFlowApplicationAutoMapperProfile : Profile
{
    public TaskFlowApplicationAutoMapperProfile()
    {
        CreateMap<Tarefa, TarefaDto>();
        CreateMap<CreateUpdateTarefaDto, Tarefa>();
    }
}
