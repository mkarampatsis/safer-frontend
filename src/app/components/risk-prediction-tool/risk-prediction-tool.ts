import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { Sidebar } from 'src/app/shared/components/sidebar/sidebar';
import { ReefViewer } from 'src/app/shared/components/reef-viewer/reef-viewer';

import '@kitware/vtk.js/Rendering/Profiles/Geometry';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';

import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';

@Component({
  imports: [Sidebar, ReefViewer],
  selector: 'app-risk-prediction-tool',
  styleUrl: './risk-prediction-tool.css',
  templateUrl: './risk-prediction-tool.html',
})
export class RiskPredictionTool implements AfterViewInit {
 @ViewChild('viewer', { static: true })
  viewer!: ElementRef<HTMLDivElement>;

  async ngAfterViewInit(): Promise<void> {

    const renderWindow = vtkRenderWindow.newInstance();

    const renderer = vtkRenderer.newInstance({
      background: [0.2, 0.2, 0.2],
    });

    renderWindow.addRenderer(renderer);

    const openGLRenderWindow = vtkOpenGLRenderWindow.newInstance();

    renderWindow.addView(openGLRenderWindow);

    const container = this.viewer.nativeElement;

    openGLRenderWindow.setContainer(container);

    const rect = container.getBoundingClientRect();

    openGLRenderWindow.setSize(
      rect.width,
      rect.height
    );

    const interactor = vtkRenderWindowInteractor.newInstance();

    interactor.setView(openGLRenderWindow);

    interactor.initialize();

    interactor.bindEvents(container);

    interactor.setInteractorStyle(
      vtkInteractorStyleTrackballCamera.newInstance()
    );

    const response = await fetch('/assets/models/REEF3D-NHFLOW-FSF-00002475-000001.vtp');

    const arrayBuffer = await response.arrayBuffer();

    const reader = vtkXMLPolyDataReader.newInstance();
    reader.parseAsArrayBuffer(arrayBuffer);

    const mapper = vtkMapper.newInstance();

    mapper.setInputData(
      reader.getOutputData()
    );
    // ====
    // const polyData = reader.getOutputData();

    // console.log(polyData);
    // console.log('Points:', polyData.getPoints().getNumberOfPoints());
    // console.log('Polys:', polyData.getPolys()?.getNumberOfValues());
    // const pointData = polyData.getPointData();

    // console.log(
    //   pointData.getArrays().map((a: { getName: () => any; }) => a.getName())
    // );

    // =====
    const actor = vtkActor.newInstance();

    actor.setMapper(mapper);

    renderer.addActor(actor);

    renderer.resetCamera();

    renderWindow.render();
  }
}
