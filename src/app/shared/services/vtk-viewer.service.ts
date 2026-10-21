import { Service } from '@angular/core';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';

import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';

import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';

import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader';
import { FieldInfo } from '../interfaces/vtk-dataset.interface';

@Service()
export class VtkViewerService {
  private renderWindow!: vtkRenderWindow;
  private renderer!: vtkRenderer;
  private actor!: vtkActor;
  private mapper!: vtkMapper;

  initialize(container: HTMLElement): void {
    this.renderWindow = vtkRenderWindow.newInstance();

    this.renderer = vtkRenderer.newInstance({
      background: [0.1, 0.1, 0.1],
    });

    this.renderWindow.addRenderer(this.renderer);

    const openGLWindow = vtkOpenGLRenderWindow.newInstance();

    this.renderWindow.addView(openGLWindow);

    openGLWindow.setContainer(container);

    const rect = container.getBoundingClientRect();

    openGLWindow.setSize(rect.width, rect.height);

    const interactor = vtkRenderWindowInteractor.newInstance();

    interactor.setView(openGLWindow);

    interactor.initialize();

    interactor.bindEvents(container);

    interactor.setInteractorStyle(vtkInteractorStyleTrackballCamera.newInstance());

    this.mapper = vtkMapper.newInstance();

    this.actor = vtkActor.newInstance();

    this.actor.setMapper(this.mapper);

    this.renderer.addActor(this.actor);
  }

  async loadVtp(fileUrl: string): Promise<void> {
    const response = await fetch(fileUrl);

    const buffer = await response.arrayBuffer();

    const reader = vtkXMLPolyDataReader.newInstance();

    reader.parseAsArrayBuffer(buffer);

    const polyData = reader.getOutputData();

    this.mapper.setInputData(polyData);

    this.renderer.resetCamera();

    this.renderWindow.render();
  }

  getScalarFields(): string[] {
    const input = this.mapper.getInputData();

    if (!input) {
      return [];
    }

    return input
      .getPointData()
      .getArrays()
      .map((a: { getName: () => any }) => a.getName());
  }

  colorBy(fieldName: string): void {
    this.mapper.setColorByArrayName(fieldName);

    this.mapper.setScalarModeToUsePointFieldData();

    this.mapper.setScalarVisibility(true);

    this.renderWindow.render();
  }

  getDatasetInfo() {
    const input = this.mapper.getInputData();

    if (!input) {
      return null;
    }

    return {
      points: input.getNumberOfPoints(),
      cells: input.getNumberOfCells(),
    };
  }

  getFields(): string[] {
    const input = this.mapper.getInputData();

    if (!input) {
      return [];
    }

    return input
      .getPointData()
      .getArrays()
      .map((array: { getName: () => any }) => array.getName());
  }

  setActiveField(fieldName: string): void {
    this.mapper.setColorByArrayName(fieldName);

    this.mapper.setScalarModeToUsePointFieldData();

    this.mapper.setScalarVisibility(true);

    this.renderWindow.render();
  }

  setWireframe(enabled: boolean): void {
    this.actor.getProperty().setRepresentation(enabled ? 1 : 2);

    this.renderWindow.render();
  }

  setEdges(enabled: boolean): void {
    this.actor.getProperty().setEdgeVisibility(enabled);

    this.renderWindow.render();
  }

  getFieldRange(fieldName: string): [number, number] {
    const input = this.mapper.getInputData();

    if (!input) {
      return [0, 0];
    }

    const array = input.getPointData().getArrayByName(fieldName);

    if (!array) {
      return [0, 0];
    }

    return array.getRange();
  }

  getFieldInfo(fieldName: string): FieldInfo | null {
    const input = this.mapper.getInputData();

    if (!input) {
      return null;
    }

    const array = input.getPointData().getArrayByName(fieldName);

    if (!array) {
      return null;
    }

    const range = array.getRange();

    return {
      name: fieldName,
      min: range[0],
      max: range[1],
      components: array.getNumberOfComponents(),
    };
  }
}
