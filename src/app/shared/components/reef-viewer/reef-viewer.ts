import { AfterViewInit, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
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

  readonly fields = signal<string[]>([]);

  readonly dataset = signal<{
    points: number;
    cells: number;
  } | null>(null);

  readonly activeField = signal<string | null>(null);

  readonly wireframe = signal(false);

  readonly edges = signal(false);

  // async ngAfterViewInit() {
  //   this.vtkViewer.initialize(this.viewer.nativeElement);

  //   await this.vtkViewer.loadVtp('/assets/models/REEF3D-NHFLOW-FSF-00002475-000001.vtp');

  //   console.log(this.vtkViewer.getScalarFields());
  // }

  async ngAfterViewInit(): Promise<void> {
    this.vtkViewer.initialize(this.viewer.nativeElement);

    await this.vtkViewer.loadVtp('/assets/models/REEF3D-NHFLOW-FSF-00002475-000001.vtp');

    this.fields.set(this.vtkViewer.getFields());

    this.dataset.set(this.vtkViewer.getDatasetInfo());

    console.log(this.fields());
  }

  selectField(field: string): void {
    this.activeField.set(field);

    this.vtkViewer.setActiveField(field);
  }

  toggleWireframe(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    this.wireframe.set(checked);

    this.vtkViewer.setWireframe(checked);
  }

  toggleEdges(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    this.edges.set(checked);

    this.vtkViewer.setEdges(checked);
  }
}
