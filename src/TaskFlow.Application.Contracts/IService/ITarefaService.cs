using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaskFlow.TarefasDto;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace TaskFlow.IService
{
    public interface ITarefaService:
    ICrudAppService< //Define os metodos cruds já criados do ABP
        TarefaDto, //Use para mostrar o livro
        Guid, //Chave primaria da tarefa
        PagedAndSortedResultRequestDto, //Use para paginação e shorts da pagina
        CreateUpdateTarefaDto> //Use para criar e atualizar as tarefas 
    {
    }
}
