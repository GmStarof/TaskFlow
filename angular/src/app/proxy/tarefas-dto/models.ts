import type { TarefasStatus } from '../tarefa-status/tarefas-status.enum';
import type { AuditedEntityDto } from '@abp/ng.core';

export interface CreateUpdateTarefaDto {
  titulo?: string;
  descricao?: string;
  status: TarefasStatus;
}

export interface TarefaDto extends AuditedEntityDto<string> {
  titulo?: string;
  descricao?: string;
  status: TarefasStatus;
  dataCriacao?: string;
}
