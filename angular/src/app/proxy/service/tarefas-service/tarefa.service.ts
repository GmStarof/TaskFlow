import { PagedResultDto, Rest, RestService } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { CreateUpdateTarefaDto, TarefaConsultaDto, TarefaDto, TarefaResumoDto } from '../../tarefas-dto/models';
import type { TarefasStatus } from '../../tarefa-status/tarefas-status.enum';

@Injectable({ providedIn: 'root' })
export class TarefaService {
  apiName = 'Default';
  private readonly baseUrl = '/api/app/tarefa';

  constructor(private restService: RestService) {}

  create(input: CreateUpdateTarefaDto, config?: Partial<Rest.Config>) {
    return this.restService.request<CreateUpdateTarefaDto, TarefaDto>({
      method: 'POST', url: this.baseUrl, body: input,
    }, { apiName: this.apiName, ...config });
  }

  delete(id: string, config?: Partial<Rest.Config>) {
    return this.restService.request<void, void>({
      method: 'DELETE', url: `${this.baseUrl}/${id}`,
    }, { apiName: this.apiName, ...config });
  }

  get(id: string, config?: Partial<Rest.Config>) {
    return this.restService.request<void, TarefaDto>({
      method: 'GET', url: `${this.baseUrl}/${id}`,
    }, { apiName: this.apiName, ...config });
  }

  getList(input: TarefaConsultaDto, config?: Partial<Rest.Config>) {
    const { sorting, skipCount, maxResultCount, busca, filtro, prioridade, dataReferencia } = input;
    return this.restService.request<void, PagedResultDto<TarefaDto>>({
      method: 'GET', url: this.baseUrl,
      params: { sorting, skipCount, maxResultCount, busca, filtro, prioridade, dataReferencia },
    }, { apiName: this.apiName, ...config });
  }

  getResumo(dataReferencia: string, config?: Partial<Rest.Config>) {
    return this.restService.request<void, TarefaResumoDto>({
      method: 'GET', url: `${this.baseUrl}/resumo`, params: { dataReferencia },
    }, { apiName: this.apiName, ...config });
  }

  update(id: string, input: CreateUpdateTarefaDto, config?: Partial<Rest.Config>) {
    return this.restService.request<CreateUpdateTarefaDto, TarefaDto>({
      method: 'PUT', url: `${this.baseUrl}/${id}`, body: input,
    }, { apiName: this.apiName, ...config });
  }

  updateStatus(id: string, status: TarefasStatus, config?: Partial<Rest.Config>) {
    return this.restService.request<{ status: TarefasStatus }, TarefaDto>({
      method: 'PUT', url: `${this.baseUrl}/${id}/status`, body: { status },
    }, { apiName: this.apiName, ...config });
  }
}
