import { Service } from '@angular/core';
import { FieldInfo, PickedPoint } from 'src/app/shared/interfaces/vtk-dataset.interface';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';
import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkPointPicker from '@kitware/vtk.js/Rendering/Core/PointPicker';
import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData';

@Service()
export class VtkViewerService {
  private renderWindow!: vtkRenderWindow;
  private renderer!: vtkRenderer;
  private actor!: vtkActor;
  private mapper!: vtkMapper;
  private lookupTable = vtkColorTransferFunction.newInstance();
  private picker = vtkPointPicker.newInstance();
  private currentPolyData: vtkPolyData | null = null;

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

    this.lookupTable.applyColorMap({
      Name: 'Cool to Warm',
      RGBPoints: [0.0, 0.231, 0.298, 0.753, 0.5, 0.865, 0.865, 0.865, 1.0, 0.706, 0.016, 0.15],
    });

    this.lookupTable.updateRange();
  }

  async loadVtp(fileUrl: string): Promise<void> {
    const response = await fetch(fileUrl);

    const buffer = await response.arrayBuffer();

    const reader = vtkXMLPolyDataReader.newInstance();

    reader.parseAsArrayBuffer(buffer);

    const polyData = reader.getOutputData();

    this.currentPolyData = reader.getOutputData();
    // console.log(
    //   this.currentPolyData
    //     ?.getPointData()
    //     .getArrays()
    //     .map((a) => ({
    //       name: a.getName(),
    //       components: a.getNumberOfComponents(),
    //     })),
    // );

    this.mapper.setInputData(polyData);

    this.renderer.resetCamera();

    this.renderWindow.render();
  }

  async loadVtpFromFile(file: File): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();

    const reader = vtkXMLPolyDataReader.newInstance();

    reader.parseAsArrayBuffer(arrayBuffer);

    const polyData = reader.getOutputData();

    this.currentPolyData = reader.getOutputData();
    // console.log(
    //   this.currentPolyData
    //     ?.getPointData()
    //     .getArrays()
    //     .map((a) => ({
    //       name: a.getName(),
    //       components: a.getNumberOfComponents(),
    //     })),
    // );

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

  getColorSamples(): string[] {
    const colors: string[] = [];

    for (let i = 0; i < 10; i++) {
      const rgb = [0, 0, 0];

      this.lookupTable.getColor(i / 9, rgb);

      colors.push(
        `rgb(
        ${Math.round(rgb[0] * 255)},
        ${Math.round(rgb[1] * 255)},
        ${Math.round(rgb[2] * 255)}
      )`,
      );
    }

    return colors;
  }

  // setActiveField(fieldName: string): void {
  //   this.mapper.setColorByArrayName(fieldName);

  //   this.mapper.setScalarModeToUsePointFieldData();

  //   this.mapper.setScalarVisibility(true);

  //   this.renderWindow.render();
  // }

  setActiveField(fieldName: string): void {
    const input = this.mapper.getInputData();

    if (!input) {
      return;
    }

    const array = input.getPointData().getArrayByName(fieldName);

    if (!array) {
      return;
    }

    const range = array.getRange();

    this.lookupTable.setMappingRange(range[0], range[1]);
    this.lookupTable.updateRange();
    this.mapper.setLookupTable(this.lookupTable);
    this.mapper.setScalarRange(range[0], range[1]);
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

  // For showing node data when clicking to visualization
  pickPoint(x: number, y: number): PickedPoint | null {
    if (!this.currentPolyData) {
      return null;
    }

    this.picker.pick([x, y, 0], this.renderer);

    const pointId = this.picker.getPointId();

    if (pointId < 0) {
      return null;
    }

    const point = this.currentPolyData.getPoints().getPoint(pointId);
    const coordinates: [number, number, number] = [point[0], point[1], point[2]];
    const values: Record<string, any> = {};
    const arrays = this.currentPolyData.getPointData().getArrays();

    arrays.forEach((array) => {
      const tuple = Array.from(array.getTuple(pointId));

      values[array.getName()] = tuple.length === 1 ? tuple[0] : tuple;
    });

    const velocity = values['velocity'];

    if (Array.isArray(velocity) && velocity.length === 3) {
      values['velocityMagnitude'] = Math.sqrt(
        velocity[0] * velocity[0] + velocity[1] * velocity[1] + velocity[2] * velocity[2],
      );
    }

    return { pointId, coordinates, values };
  }
}
