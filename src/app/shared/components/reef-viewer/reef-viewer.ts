import { AfterViewInit, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { VtkViewerService } from 'src/app/shared/services/vtk-viewer.service';
import { FieldInfo } from '../../interfaces/vtk-dataset.interface';

import '@kitware/vtk.js/Rendering/Profiles/Geometry';

@Component({
  imports: [DecimalPipe],
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

  // For Scalar Legend
  readonly activeRange = signal<[number, number] | null>(null);

  // For timelapse
  readonly currentFrame = signal(1);
  // readonly frameCount = signal(0);
  readonly frameCount = signal(100);
  readonly isPlaying = signal(false);
  private playbackTimer?: number;
  readonly frameRate = signal(2);

  // Loading
  readonly loading = signal(false);

  // For fields
  readonly selectedFieldInfo = signal<FieldInfo | null>(null);

  // for colors
  legendColors: string[] = [];

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
    // this.activeRange.set(this.vtkViewer.getFieldRange(field));
    this.selectedFieldInfo.set(this.vtkViewer.getFieldInfo(field));

    this.legendColors = this.vtkViewer.getColorSamples();
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

  private buildFrameName(frame: number): string {
    const padded = frame.toString().padStart(6, '0');

    return `/assets/models/REEF3D-NHFLOW-FSF-00002475-${padded}.vtp`;
  }

  // async loadFrame(frameNumber: number): Promise<void> {
  async loadFrame(frame: number): Promise<void> {
    // this.currentFrame.set(frameNumber);

    // await this.vtkViewer.loadVtp(this.buildFrameName(frameNumber));
    try {
      this.loading.set(true);

      this.currentFrame.set(frame);

      const filename = this.buildFrameName(frame);

      await this.vtkViewer.loadVtp(filename);
    } catch (error) {
      console.error(error);
    } finally {
      this.loading.set(false);
    }
  }

  async onFrameChanged(event: Event): Promise<void> {
    const value = Number((event.target as HTMLInputElement).value);

    await this.loadFrame(value);
  }

  play(): void {
    if (this.isPlaying()) {
      return;
    }

    this.isPlaying.set(true);

    // this.playbackTimer = window.setInterval(async () => {
    //   let frame = this.currentFrame() + 1;

    //   if (frame > this.frameCount()) {
    //     frame = 1;
    //   }

    //   await this.loadFrame(frame);
    // }, 500);
    this.playbackLoop();
  }

  pause(): void {
    // if (this.playbackTimer) {
    //   clearInterval(this.playbackTimer);

    //   this.playbackTimer = undefined;
    // }

    this.isPlaying.set(false);
  }

  private async playbackLoop(): Promise<void> {
    while (this.isPlaying()) {
      // let next = this.currentFrame() + 1;

      // if (next > this.frameCount()) {
      //   next = 1;
      // }

      // await this.loadFrame(next);

      // await new Promise((resolve) => setTimeout(resolve, 300));
      const next = this.currentFrame() + 1 > this.frameCount() ? 1 : this.currentFrame() + 1;

      await this.loadFrame(next);

      await new Promise((resolve) => setTimeout(resolve, 1000 / this.frameRate()));
    }
  }

  setFrameRate(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);

    this.frameRate.set(value);
  }
}
