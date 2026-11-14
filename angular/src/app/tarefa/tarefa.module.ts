import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TarefaRoutingModule } from './tarefa-routing.module';
import { TarefaComponent } from './tarefa.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkspaceComponent } from '../shared/workspace.component';



@NgModule({
  declarations: [
    TarefaComponent
  ],
  imports: [
    CommonModule,
    TarefaRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    WorkspaceComponent
  ]
})
export class TarefaModule { }
