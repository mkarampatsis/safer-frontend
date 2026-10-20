import { Routes } from '@angular/router';
import { Landing } from './components/landing/landing';
import { Module1 } from './components/module1/module1';
import { Module2 } from './components/module2/module2';
import { Module3 } from './components/module3/module3';
import { Module4 } from './components/module4/module4';
import { RiskPredictionTool } from './components/risk-prediction-tool/risk-prediction-tool';
import { ReefViewer } from './shared/components/reef-viewer/reef-viewer';

export const routes: Routes = [
  { path: 'module1', component: Module1 },
  { path: 'module2', component: Module2 },
  { path: 'module3', component: Module3 },
  { path: 'module4', component: Module4 },
  { path: 'landing', component: Landing },
  { path: 'risk-prediction-tool', component: RiskPredictionTool},
  {path: 'reef-viewer', component: ReefViewer},
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
];
