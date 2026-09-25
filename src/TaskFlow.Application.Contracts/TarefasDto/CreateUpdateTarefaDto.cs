using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaskFlow.TarefaStatus;
using System.ComponentModel.DataAnnotations;

namespace TaskFlow.TarefasDto
{
    public class CreateUpdateTarefaDto
    {
        [Required]
        [StringLength(200)]
        public required string Titulo { get; set; }
        [Required]
        [StringLength(4000)]
        public required string Descricao { get; set; }
        [EnumDataType(typeof(TarefasStatus))]
        public required TarefasStatus Status { get; set; } // "Pendente" ou "Concluída"
    }
}
