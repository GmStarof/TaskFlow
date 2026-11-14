import { ListService, PagedResultDto } from '@abp/ng.core';
import { Confirmation, ConfirmationService } from '@abp/ng.theme.shared';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TarefaService } from '@proxy/service/tarefas-service';
import { TarefaDto, TarefaFiltro, TarefaPrioridade } from '@proxy/tarefas-dto';
import { TarefasStatus } from '@proxy/tarefa-status';
import { catchError, finalize, of } from 'rxjs';
import { dataLocal } from '../shared/tarefa-date';

@Component({
  selector: 'app-tarefa',
  templateUrl: './tarefa.component.html',
  styleUrl: './tarefa.component.scss',
  providers: [ListService],
})
export class TarefaComponent implements OnInit {
  tarefa: PagedResultDto<TarefaDto> = { items: [], totalCount: 0 };
  selecionarTarefa = {} as TarefaDto;
  isModalOpen = false;
  isSaving = false;
  form: FormGroup;
  busca = '';
  filtro = TarefaFiltro.Todas;
  prioridade: TarefaPrioridade | undefined;
  erroLista = false;
  mensagem = '';
  erroAcao = '';
  erroFormulario = '';
  readonly busy = new Set<string>();
  readonly status = TarefasStatus;
  readonly concluida = TarefasStatus.Concluída;
  readonly alta = TarefaPrioridade.Alta;
  readonly opcoesFiltro = [
    { value: TarefaFiltro.Todas, label: 'Todas' },
    { value: TarefaFiltro.Pendentes, label: 'Pendentes' },
    { value: TarefaFiltro.Hoje, label: 'Hoje' },
    { value: TarefaFiltro.Atrasadas, label: 'Atrasadas' },
    { value: TarefaFiltro.Concluidas, label: 'Concluídas' },
  ];
  readonly opcoesPrioridade = [
    { value: TarefaPrioridade.Baixa, label: 'Baixa' },
    { value: TarefaPrioridade.Normal, label: 'Normal' },
    { value: TarefaPrioridade.Alta, label: 'Alta' },
  ];
  readonly config = { skipHandleError: true };
  dia = dataLocal();

  constructor(
    public readonly list: ListService,
    private tarefaService: TarefaService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private route?: ActivatedRoute,
  ) {}

  ngOnInit() {
    const filtro = Number(this.route?.snapshot.queryParamMap.get('filtro'));
    this.filtro = this.opcoesFiltro.find(option => option.value === filtro)?.value ?? TarefaFiltro.Todas;
    this.list.maxResultCount = 10;
    this.list.hookToQuery<TarefaDto>(query => {
      this.erroLista = false;
      this.dia = dataLocal();
      return this.tarefaService.getList({
        ...query, sorting: 'DataCriacao DESC, Id DESC', busca: this.busca.trim() || undefined,
        filtro: this.filtro, prioridade: this.prioridade, dataReferencia: this.dia,
      }, this.config).pipe(catchError(() => {
        this.erroLista = true;
        return of(this.tarefa);
      }));
    }).subscribe(response => {
      this.tarefa = response;
      if (!this.erroLista) {
        const lastPage = Math.max(0, Math.ceil(response.totalCount / this.list.maxResultCount) - 1);
        if (this.list.page > lastPage) this.list.page = lastPage;
      }
    });
  }

  aplicarFiltros() {
    if (this.list.page === 0) this.list.get();
    else this.list.page = 0;
  }

  limparFiltros() {
    this.busca = '';
    this.filtro = TarefaFiltro.Todas;
    this.prioridade = undefined;
    this.aplicarFiltros();
  }

  prioridadeLabel(prioridade: TarefaPrioridade) {
    return this.opcoesPrioridade.find(option => option.value === prioridade)?.label ?? 'Normal';
  }

  createTarefa() {
    this.selecionarTarefa = {} as TarefaDto;
    this.buildForm();
    this.isModalOpen = true;
  }

  buildForm() {
    this.erroFormulario = '';
    this.form = this.fb.group({
      titulo: [this.selecionarTarefa.titulo ?? '', [Validators.required, Validators.maxLength(200), Validators.pattern(/\S/)]],
      descricao: [this.selecionarTarefa.descricao ?? '', [Validators.required, Validators.maxLength(4000), Validators.pattern(/\S/)]],
      status: [this.selecionarTarefa.status ?? TarefasStatus.Pendente, Validators.required],
      prioridade: [this.selecionarTarefa.prioridade ?? TarefaPrioridade.Normal, Validators.required],
      prazo: [this.selecionarTarefa.prazo ?? ''],
    });
  }

  salvar() {
    if (this.isSaving) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.erroFormulario = '';
    const input = { ...this.form.value, prazo: this.form.value.prazo || null };
    const id = this.selecionarTarefa.id;
    const request = id ? this.tarefaService.update(id, input, this.config) : this.tarefaService.create(input, this.config);
    this.isSaving = true;
    request.pipe(finalize(() => this.isSaving = false)).subscribe({
      next: () => {
        this.isModalOpen = false;
        this.mensagem = id ? 'Tarefa atualizada.' : 'Tarefa criada.';
        this.list.get();
      },
      error: () => this.erroFormulario = 'Não foi possível salvar. Confira os campos e tente novamente.',
    });
  }

  editarTarefa(id: string) {
    if (this.busy.has(id)) return;
    this.erroAcao = '';
    this.busy.add(id);
    this.tarefaService.get(id, this.config).pipe(finalize(() => this.busy.delete(id))).subscribe({
      next: tarefa => {
        this.selecionarTarefa = tarefa;
        this.buildForm();
        this.isModalOpen = true;
      },
      error: () => this.erroAcao = 'Não foi possível abrir a tarefa. Tente novamente.',
    });
  }

  alternarStatus(tarefa: TarefaDto) {
    const id = tarefa.id;
    if (this.busy.has(id)) return;
    const status = tarefa.status === TarefasStatus.Pendente ? TarefasStatus.Concluída : TarefasStatus.Pendente;
    this.erroAcao = '';
    this.busy.add(id);
    this.tarefaService.updateStatus(id, status, this.config).pipe(finalize(() => this.busy.delete(id))).subscribe({
      next: atualizada => {
        tarefa.status = atualizada.status;
        this.mensagem = status === TarefasStatus.Concluída ? 'Tarefa concluída.' : 'Tarefa reaberta.';
        this.list.get();
      },
      error: () => this.erroAcao = 'Não foi possível alterar o status. Tente novamente.',
    });
  }

  deletar(id: string) {
    if (this.busy.has(id)) return;
    this.busy.add(id);
    this.confirmation.warn('A tarefa será excluída.', 'Excluir tarefa?').subscribe(status => {
      if (status !== Confirmation.Status.confirm) {
        this.busy.delete(id);
        return;
      }
      this.erroAcao = '';
      this.tarefaService.delete(id, this.config).pipe(finalize(() => this.busy.delete(id))).subscribe({
        next: () => {
          this.mensagem = 'Tarefa excluída.';
          this.list.get();
        },
        error: () => this.erroAcao = 'Não foi possível excluir a tarefa. Tente novamente.',
      });
    });
  }
}
