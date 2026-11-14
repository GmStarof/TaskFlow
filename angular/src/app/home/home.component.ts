import { AuthService } from '@abp/ng.core';
import { Component, OnInit } from '@angular/core';
import { TarefaService } from '@proxy/service/tarefas-service';
import { TarefaFiltro, TarefaResumoDto } from '@proxy/tarefas-dto';
import { finalize } from 'rxjs';
import { dataLocal } from '../shared/tarefa-date';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  resumo: TarefaResumoDto;
  carregando = false;
  erro = false;
  readonly indicadores = [
    { campo: 'pendentes', label: 'Pendentes', icon: 'fa-list-ul', filtro: TarefaFiltro.Pendentes },
    { campo: 'hoje', label: 'Para hoje', icon: 'fa-calendar-day', filtro: TarefaFiltro.Hoje },
    { campo: 'atrasadas', label: 'Atrasadas', icon: 'fa-clock', filtro: TarefaFiltro.Atrasadas },
    { campo: 'concluidas', label: 'Concluídas', icon: 'fa-check', filtro: TarefaFiltro.Concluidas },
  ] as const;

  constructor(public readonly auth: AuthService, private tarefas: TarefaService) {}

  ngOnInit() {
    if (this.auth.isAuthenticated) this.carregar();
  }

  carregar() {
    if (this.carregando) return;
    this.erro = false;
    this.carregando = true;
    this.tarefas.getResumo(dataLocal(), { skipHandleError: true })
      .pipe(finalize(() => this.carregando = false)).subscribe({
        next: resumo => this.resumo = resumo,
        error: () => this.erro = true,
      });
  }
}
