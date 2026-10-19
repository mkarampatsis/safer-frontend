import { Component } from '@angular/core';
import { Sidebar } from 'src/app/shared/components/sidebar/sidebar';

@Component({
  imports: [Sidebar],
  selector: 'app-risk-prediction-tool',
  styleUrl: './risk-prediction-tool.css',
  templateUrl: './risk-prediction-tool.html',
})
export class RiskPredictionTool {}
