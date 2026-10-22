import { Component } from '@angular/core';
import { Sidebar } from 'src/app/shared/components/sidebar/sidebar';
import { ReefViewer } from 'src/app/shared/components/reef-viewer/reef-viewer';

@Component({
  imports: [Sidebar, ReefViewer],
  selector: 'app-risk-prediction-tool',
  styleUrl: './risk-prediction-tool.css',
  templateUrl: './risk-prediction-tool.html',
})

export class RiskPredictionTool {
}
