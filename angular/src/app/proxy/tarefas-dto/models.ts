import type { AuditedEntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';
import type { TarefasStatus } from '../tarefa-status/tarefas-status.enum';

export enum TarefaPrioridade { Normal, Baixa, Alta }
export enum TarefaFiltro { Todas, Pendentes, Hoje, Atrasadas, Concluidas }

export interface CreateUpdateTarefaDto {
  titulo?: string;
  descricao?: string;
  status: TarefasStatus;
  prioridade?: TarefaPrioridade;
  prazo?: string | null;
}

export interface TarefaDto extends AuditedEntityDto<string>, CreateUpdateTarefaDto {
  dataCriacao?: string;
}

export interface TarefaConsultaDto extends PagedAndSortedResultRequestDto {
  busca?: string;
  filtro?: TarefaFiltro;
  prioridade?: TarefaPrioridade;
  dataReferencia?: string;
}

export interface TarefaResumoDto {
  pendentes: number;
  hoje: number;
  atrasadas: number;
  concluidas: number;
}
