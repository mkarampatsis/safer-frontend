import { Component, inject, signal  } from '@angular/core';
import {
	NgbNavContent,
	NgbNav,
	NgbNavItem,
	NgbNavItemRole,
	NgbNavLinkButton,
	NgbNavLinkBase,
	NgbNavOutlet,
} from '@ng-bootstrap/ng-bootstrap/nav';
import { Sidebar } from 'src/app/shared/components/sidebar/sidebar';
import {SidebarService} from 'src/app/shared/services/sidebar.service';
import { ReefViewer } from 'src/app/shared/components/reef-viewer/reef-viewer';

@Component({
  imports: [
    NgbNavContent, 
    NgbNav, 
    NgbNavItem, 
    NgbNavItemRole, 
    NgbNavLinkButton, 
    NgbNavLinkBase, 
    NgbNavOutlet,
    Sidebar, 
    ReefViewer
  ],
  selector: 'app-risk-prediction-tool',
  styleUrl: './risk-prediction-tool.css',
  templateUrl: './risk-prediction-tool.html',
})

export class RiskPredictionTool {
  sidebarService = inject(SidebarService);
  readonly active = signal(1);

  siteSelection = this.sidebarService.savedSiteSelection;
  hazardSelection = this.sidebarService.savedHazardSelection;
}
