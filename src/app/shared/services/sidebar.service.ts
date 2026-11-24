import { Service, signal } from '@angular/core';
import { SelectedSite } from '../interfaces/sites.interface';
import { SelectedHazard } from '../interfaces/hazard.interface';

@Service()
export class SidebarService {
  savedSiteSelection = signal<SelectedSite | null>(null);
  savedHazardSelection = signal<SelectedHazard | null>(null);
}
