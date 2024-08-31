import { ListService, PagedResultDto } from '@abp/ng.core';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TarefaService } from '@proxy/service/tarefas-service';
import { TarefasStatus } from '@proxy/tarefa-status';
import { TarefaDto } from '@proxy/tarefas-dto';
import { NgbDateNativeAdapter, NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';
import { Confirmation, ConfirmationService } from '@abp/ng.theme.shared';

@Component({
  selector: 'app-tarefa',
  templateUrl: './tarefa.component.html',
  styleUrl: './tarefa.component.scss',
  providers: [ListService,
    { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }],
})
export class TarefaComponent {
  tarefa = { items: [], totalCount: 0 } as PagedResultDto<TarefaDto>;
  isModalOpen = false;

  selecionarTarefa = {} as TarefaDto;

  form: FormGroup;
  tarefaStatus = TarefasStatus;


  constructor(public readonly list: ListService, private tarefaService: TarefaService, private fb: FormBuilder, private confirmation: ConfirmationService) { }

  ngOnInit() {
    const tarefaStreamCreator = (query) => this.tarefaService.getList(query);

    this.list.hookToQuery(tarefaStreamCreator).subscribe((response) => {
      this.tarefa = response;
    });
  }

  createTarefa() {
    this.buildForm();
    this.isModalOpen = true;
  }

  buildForm() {
    this.form = this.fb.group({
      titulo: [this.selecionarTarefa.titulo || '', Validators.required],
      status: [this.selecionarTarefa.status || null, Validators.required],
      descricao: [this.selecionarTarefa.descricao || null, Validators.required],
      dataCriacao: [this.selecionarTarefa.dataCriacao || null, Validators.required],
    });
  }


  salvar() {
    if (this.form.invalid) {
      return;
    }

    const request = this.selecionarTarefa.id
      ? this.tarefaService.update(this.selecionarTarefa.id, this.form.value)
      : this.tarefaService.create(this.form.value);

    request.subscribe(() => {
      this.isModalOpen = false;
      this.form.reset();
      this.list.get();
    });
  }

  editarTarefa(id: string) {
    this.tarefaService.get(id).subscribe((tarefa) => {
      this.selecionarTarefa = tarefa;
      this.buildForm();
      this.isModalOpen = true;
    });
  }

  deletar(id: string) {
    this.confirmation.warn('Você tem certeza de que deseja Deletar essa Tarefa?', 'Tem certeza').subscribe((status) => {
      if (status === Confirmation.Status.confirm) {
        this.tarefaService.delete(id).subscribe(() => this.list.get());
      }
    });
  }
}
