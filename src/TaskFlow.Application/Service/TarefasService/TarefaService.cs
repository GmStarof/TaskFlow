using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaskFlow.IService;
using TaskFlow.Tarefas;
using TaskFlow.TarefasDto;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace TaskFlow.Service.TarefasService
{
    public class TarefaService: 
        CrudAppService<
        Tarefa, //A entidade Tarefa
        TarefaDto, 
        Guid, 
        PagedAndSortedResultRequestDto, 
        CreateUpdateTarefaDto>, 
        ITarefaService //Iplementação da ITarefaService
    {
        public TarefaService(IRepository<Tarefa, Guid> repository)
            : base(repository)
        {

        }
    }
}
