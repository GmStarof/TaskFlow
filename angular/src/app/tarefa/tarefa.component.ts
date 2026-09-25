import { ListService, PagedResultDto } from '@abp/ng.core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TarefaService } from '@proxy/service/tarefas-service';
import { TarefasStatus } from '@proxy/tarefa-status';
import { TarefaDto } from '@proxy/tarefas-dto';
import { Confirmation, ConfirmationService } from '@abp/ng.theme.shared';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-tarefa',
  templateUrl: './tarefa.component.html',
  styleUrl: './tarefa.component.scss',
  providers: [ListService],
})
export class TarefaComponent implements OnInit {
  tarefa = { items: [], totalCount: 0 } as PagedResultDto<TarefaDto>;
  isModalOpen = false;
  isSaving = false;

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
    this.selecionarTarefa = {} as TarefaDto;
    this.buildForm();
    this.isModalOpen = true;
  }

  buildForm() {
    this.form = this.fb.group({
      titulo: [this.selecionarTarefa.titulo ?? '', [Validators.required, Validators.maxLength(200), Validators.pattern(/\S/)]],
      status: [this.selecionarTarefa.status ?? TarefasStatus.Pendente, Validators.required],
      descricao: [this.selecionarTarefa.descricao ?? '', [Validators.required, Validators.maxLength(4000), Validators.pattern(/\S/)]],
    });
  }


  salvar() {
    if (this.form.invalid || this.isSaving) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.selecionarTarefa.id
      ? this.tarefaService.update(this.selecionarTarefa.id, this.form.value)
      : this.tarefaService.create(this.form.value);

    this.isSaving = true;
    request.pipe(finalize(() => this.isSaving = false)).subscribe(() => {
      this.isModalOpen = false;
      this.form.reset();
      this.selecionarTarefa = {} as TarefaDto;
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
