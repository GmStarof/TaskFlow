import { RestService, Rest } from '@abp/ng.core';
import type { PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { CreateUpdateTarefaDto, TarefaDto } from '../../tarefas-dto/models';

@Injectable({
  providedIn: 'root',
})
export class TarefaService {
  apiName = 'Default';
  

  create = (input: CreateUpdateTarefaDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, TarefaDto>({
      method: 'POST',
      url: '/api/app/tarefa',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/tarefa/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, TarefaDto>({
      method: 'GET',
      url: `/api/app/tarefa/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<TarefaDto>>({
      method: 'GET',
      url: '/api/app/tarefa',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateTarefaDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, TarefaDto>({
      method: 'PUT',
      url: `/api/app/tarefa/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
