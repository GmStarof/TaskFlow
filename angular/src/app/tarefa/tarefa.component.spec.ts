import { ListService } from '@abp/ng.core';
import { FormBuilder } from '@angular/forms';
import { ConfirmationService } from '@abp/ng.theme.shared';
import { TarefaService } from '@proxy/service/tarefas-service';
import { TarefasStatus } from '@proxy/tarefa-status';
import { of, Subject } from 'rxjs';
import { TarefaDto } from '@proxy/tarefas-dto';
import { TarefaComponent } from './tarefa.component';

describe('TarefaComponent', () => {
  let component: TarefaComponent;
  let service: jasmine.SpyObj<TarefaService>;
  let list: jasmine.SpyObj<ListService>;

  beforeEach(() => {
    service = jasmine.createSpyObj('TarefaService', ['create', 'update', 'get']);
    list = jasmine.createSpyObj('ListService', ['get']);
    component = new TarefaComponent(list, service, new FormBuilder(), {} as ConfirmationService);
  });

  it('creates a new task after editing an existing task', () => {
    component.selecionarTarefa = { id: 'old-task', titulo: 'Antiga', descricao: 'Antiga', status: TarefasStatus.Concluída };
    service.create.and.returnValue(of({ id: 'new-task', status: TarefasStatus.Pendente }));
    component.createTarefa();
    expect(component.form.value.titulo).toBe('');
    component.form.patchValue({ titulo: 'Nova', descricao: 'Nova descrição' });
    component.salvar();
    expect(service.create).toHaveBeenCalled();
    expect(service.update).not.toHaveBeenCalled();
    expect(component.isModalOpen).toBeFalse();
  });

  it('preserves pending status when editing', () => {
    component.selecionarTarefa = { id: 'task', titulo: 'Teste', descricao: 'Descrição', status: TarefasStatus.Pendente };
    component.buildForm();
    expect(component.form.value.status).toBe(0);
    expect(component.form.valid).toBeTrue();
    expect(component.form.contains('dataCriacao')).toBeFalse();
  });

  it('rejects blank titles and descriptions', () => {
    component.createTarefa();
    component.form.patchValue({ titulo: '   ', descricao: '   ' });
    component.salvar();
    expect(component.form.invalid).toBeTrue();
    expect(service.create).not.toHaveBeenCalled();
  });

  it('prevents duplicate requests while saving', () => {
    const pending = new Subject<TarefaDto>();
    service.create.and.returnValue(pending);
    component.createTarefa();
    component.form.patchValue({ titulo: 'Teste', descricao: 'Descrição' });
    component.salvar();
    component.salvar();
    expect(service.create).toHaveBeenCalledTimes(1);
    expect(component.isSaving).toBeTrue();
    pending.next({ id: 'task', status: TarefasStatus.Pendente });
    pending.complete();
    expect(component.isSaving).toBeFalse();
  });
});
