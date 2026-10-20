import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { VtkViewerService } from 'src/app/shared/services/vtk-viewer.service';

@Component({
  imports: [],
  selector: 'app-reef-viewer',
  styleUrl: './reef-viewer.css',
  templateUrl: './reef-viewer.html',
})
export class ReefViewer implements AfterViewInit {
  @ViewChild('viewer')
  viewer!: ElementRef<HTMLDivElement>;

  vtkViewer = inject(VtkViewerService);

  async ngAfterViewInit() {
    this.vtkViewer.initialize(this.viewer.nativeElement);

    await this.vtkViewer.loadVtp('/assets/models/REEF3D-NHFLOW-FSF-00002475-000001.vtp');

    console.log(this.vtkViewer.getScalarFields());
  }
}
