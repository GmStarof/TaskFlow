import { mapEnumToOptions } from '@abp/ng.core';

export enum TarefasStatus {
  Pendente = 0,
  Concluída = 1,
}

export const tarefasStatusOptions = mapEnumToOptions(TarefasStatus);
