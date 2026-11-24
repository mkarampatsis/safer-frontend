import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { Site, Location, SelectedSite } from 'src/app/shared/interfaces/sites.interface';
import { ModalService } from 'src/app/shared/services/modal.service';
import { Hazard, Scenarios, SelectedHazard } from 'src/app/shared/interfaces/hazard.interface';
import { SidebarService } from 'src/app/shared/services/sidebar.service';


@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-select-location-hazard',
  styleUrl: './select-location-hazard.css',
  templateUrl: './select-location-hazard.html',
})

export class SelectLocationHazard {
  activeOffcanvas = inject(NgbActiveOffcanvas);
  modalService = inject(ModalService);
  sidebarService = inject(SidebarService);

  locations: Site[] = [
    {
      site: 'Greece',
      locations: [
        {
          location: 'Ithaki',
          areas: ['Frikes', 'Vathy', 'Kioni'],
        },
      ],
    },
    {
      site: 'Italy',
      locations: [
        {
          location: 'Poligano a Mare',
          areas: [],
        },
      ],
    },
  ];

  hazards: Hazard[] = [
    {
      type: 'Coastal Water Level',
      scenario: {
        name: 'Definition of scenario',
        scenarions: [
          {
            name: 'Scenario 1',
            animation: 'Critical points in the port',
          },
        ],
      },
    },
    {
      type: 'Land Rainfall',
      scenario: {
        name: 'Definition of scenario',
        scenarions: [
          {
            name: 'Scenario 1',
            animation: 'Critical points in the port',
          },
        ],
      },
    },
  ];

  selectedSite?: Site;
  selectedLocation?: Location;
  selectedArea = '';
  // readonly savedSiteSelection = signal<SelectedSite | null>(null);

  selectedHazard?: Hazard;
  selectedScenario?: Scenarios;
  // readonly savedHazardSelection = signal<SelectedHazard | null>(null);

  onSiteChange(siteName: string): void {
    this.selectedSite = this.locations.find((site) => site.site === siteName);
    this.selectedLocation = undefined;
    this.selectedArea = '';
  }

  onLocationChange(locationName: string): void {
    this.selectedLocation = this.selectedSite?.locations.find(
      (location) => location.location === locationName,
    );
    this.selectedArea = '';
  }

  saveSiteSelection(): void {
    if (!this.selectedSite || !this.selectedLocation) {
      return;
    }

    this.sidebarService.savedSiteSelection.set({
      site: this.selectedSite.site,
      location: this.selectedLocation.location,
      area: this.selectedArea,
    });
    console.log('Saved Site Selection:', this.sidebarService.savedSiteSelection());
    this.activeOffcanvas.close();
  }

  onHazardChange(type: string): void {
    this.selectedHazard = this.hazards.find((hazard) => hazard.type === type);
    this.selectedScenario = undefined;
  }

  onScenarioChange(name: string): void {
    this.selectedScenario = this.selectedHazard?.scenario.scenarions.find(
      (scenario) => scenario.name === name,
    );
  }

  saveHazardSelection(): void {
    if (!this.selectedHazard || !this.selectedScenario) return;

    this.sidebarService.savedHazardSelection.set({
      hazard: this.selectedHazard.type,
      scenario: this.selectedScenario,
    });
  }
}
