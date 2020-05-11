import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {WlayoutComponent} from './wlayout/wlayout.component';
import {ConfWrapperComponent} from './conf-wrapper/conf-wrapper.component';
import {ExamAssignmentComponent} from './exam-assignment/exam-assignment.component';
import {ExamResultsComponent} from './exam-results/exam-results.component';
import {ConfigurationsComponent} from './configurations/configurations.component';
import {ExamDetailComponent} from './exam-detail/exam-detail.component';
import { NoAccessComponent } from './no-access/no-access.component';

const routes: Routes = [
  { path: '', component: WlayoutComponent, children: [
      { path: '', component: ConfWrapperComponent },
      { path: 'exam', component: ExamAssignmentComponent},
      { path: 'results', component: ExamResultsComponent},
      { path: 'results/:id', component: ExamDetailComponent},
      { path: 'configurations', component: ConfigurationsComponent},
      { path: 'denied', component: NoAccessComponent}
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
