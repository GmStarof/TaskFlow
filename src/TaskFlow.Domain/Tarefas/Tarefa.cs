using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaskFlow.TarefaStatus;
using Volo.Abp.Domain.Entities.Auditing;

namespace TaskFlow.Tarefas
{
    public class Tarefa:AuditedAggregateRoot<Guid>
    {

        public required string Titulo { get; set; }
        public required string Descricao { get; set; }
        public required TarefasStatus Status { get; set; } // "Pendente" ou "Concluída"
        public DateTime DataCriacao { get; set; }

    }

}
