import { AfterViewInit, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { VtkViewerService } from 'src/app/shared/services/vtk-viewer.service';
import { FieldInfo, PickedPoint } from 'src/app/shared/interfaces/vtk-dataset.interface';
import { UploadedFrame } from 'src/app/shared/interfaces/vtk-dataset.interface';
import { environment } from 'src/environments/environment';

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

  modelUri = environment.modelUri;

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

  // for uploading file
  readonly uploadedFrames = signal<UploadedFrame[]>([]);
  readonly dragOver = signal(false);
  readonly uploadedFileCount = signal(0);

  // for vlialization picker
  readonly pickedPoint = signal<PickedPoint | null>(null);

  async ngAfterViewInit(): Promise<void> {
    this.vtkViewer.initialize(this.viewer.nativeElement);

    // this line if for picking nodes from vizualization
    this.viewer.nativeElement.addEventListener('click', (event: MouseEvent) => {
      const point = this.vtkViewer.pickPoint(event.offsetX, event.offsetY);

      if (point) {
        console.log("Picked Point", point);
        this.pickedPoint.set(point);
      }
    });
    
    await this.vtkViewer.loadVtp(`${this.modelUri}/models/REEF3D-NHFLOW-FSF-00002475-000001.vtp`);

    this.dataset.set(this.vtkViewer.getDatasetInfo());

    const fields = this.vtkViewer.getFields();

    this.fields.set(fields);

    if (fields.length > 0) {
      this.selectField(fields[0]);
    }
  }

  selectField(field: string): void {
    this.activeField.set(field);

    this.vtkViewer.setActiveField(field);

    this.selectedFieldInfo.set(this.vtkViewer.getFieldInfo(field));

    this.legendColors = this.vtkViewer.getColorSamples();
    // console.log(this.legendColors);
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

    return `${this.modelUri}/models/REEF3D-NHFLOW-FSF-00002475-${padded}.vtp`;
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

  // async onFrameChanged(event: Event): Promise<void> {
  //   const value = Number((event.target as HTMLInputElement).value);

  //   await this.loadFrame(value);
  // }

  async onFrameChanged(event: Event): Promise<void> {
    const index = Number((event.target as HTMLInputElement).value) - 1;

    await this.loadUploadedFrame(index);
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

  // private async playbackLoop(): Promise<void> {
  //   while (this.isPlaying()) {
  //     // let next = this.currentFrame() + 1;

  //     // if (next > this.frameCount()) {
  //     //   next = 1;
  //     // }

  //     // await this.loadFrame(next);

  //     // await new Promise((resolve) => setTimeout(resolve, 300));
  //     const next = this.currentFrame() + 1 > this.frameCount() ? 1 : this.currentFrame() + 1;

  //     await this.loadFrame(next);

  //     await new Promise((resolve) => setTimeout(resolve, 1000 / this.frameRate()));
  //   }
  // }

  private async playbackLoop(): Promise<void> {
    while (this.isPlaying()) {
      const frames = this.uploadedFrames();

      if (!frames.length) {
        this.pause();

        return;
      }

      let next = this.currentFrame();

      if (next >= frames.length) {
        next = 0;
      }

      await this.loadUploadedFrame(next);

      await new Promise((resolve) => setTimeout(resolve, 1000 / this.frameRate()));
    }
  }

  setFrameRate(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);

    this.frameRate.set(value);
  }

  // Upload file procedures
  // async onFilesSelected(event: Event): Promise<void> {
  //   const input = event.target as HTMLInputElement;

  //   const files = Array.from(input.files ?? []);

  //   if (!files.length) {
  //     return;
  //   }

  //   const frames = files
  //     .map((file) => {
  //       const match = file.name.match(/-(\d+)\.vtp$/i);

  //       return {
  //         frame: Number(match?.[1] ?? 0),

  //         file,
  //       };
  //     })
  //     .sort((a, b) => a.frame - b.frame);

  //   this.uploadedFrames.set(frames);

  //   this.frameCount.set(frames.length);

  //   await this.loadUploadedFrame(0);
  // }
  async onFilesSelected(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;

    const files = Array.from(target.files ?? []);

    await this.processFiles(files);
  }

  // async loadUploadedFrame(index: number): Promise<void> {
  //   const frames = this.uploadedFrames();

  //   if (!frames.length) {
  //     return;
  //   }

  //   await this.vtkViewer.loadVtpFromFile(frames[index].file);

  //   this.currentFrame.set(index + 1);

  //   const fields = this.vtkViewer.getFields();

  //   this.fields.set(fields);

  //   this.dataset.set(this.vtkViewer.getDatasetInfo());

  //   if (fields.length) {
  //     this.selectField(fields[0]);
  //   }
  // }

  async loadUploadedFrame(index: number): Promise<void> {
    const frames = this.uploadedFrames();

    if (!frames.length) {
      return;
    }

    this.loading.set(true);

    try {
      const frame = frames[index];

      await this.vtkViewer.loadVtpFromFile(frame.file);

      this.currentFrame.set(index + 1);

      const fields = this.vtkViewer.getFields();

      this.fields.set(fields);

      this.dataset.set(this.vtkViewer.getDatasetInfo());

      if (fields.length) {
        this.selectField(fields[0]);
      }
    } finally {
      this.loading.set(false);
    }
  }

  // Drag and Drop
  onDragOver(event: DragEvent): void {
    event.preventDefault();

    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();

    this.dragOver.set(false);
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();

    this.dragOver.set(false);

    const files = Array.from(event.dataTransfer?.files ?? []);

    await this.processFiles(files);
  }

  private async processFiles(files: File[]): Promise<void> {
    const frames = files
      .filter((file) => file.name.toLowerCase().endsWith('.vtp'))
      .map((file) => {
        const match = file.name.match(/-(\d+)\.vtp$/i);

        return {
          frame: Number(match?.[1] ?? 0),

          file,
        };
      })
      .sort((a, b) => a.frame - b.frame);

    this.uploadedFrames.set(frames);

    this.frameCount.set(frames.length);

    this.uploadedFileCount.set(frames.length);

    if (frames.length) {
      await this.loadUploadedFrame(0);
    }
  }
}
