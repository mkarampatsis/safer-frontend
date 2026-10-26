export interface VtkScalarField {
  name: string;
  components: number;
}

export interface VtkDatasetInfo {
  points: number;
  cells: number;
  scalarFields: VtkScalarField[];
}

// export interface ViewerState {
//   loadedFile?: string;
//   activeField?: string;
//   dataset?: VtkDatasetInfo;
// }

export interface ViewerState {
  points: number;
  cells: number;
  activeField: string | null;
  fields: string[];
  wireframe: boolean;
  edges: boolean;
}

export interface TimeSeriesFrame {
  step: number;
  file: string;
}

export interface FieldInfo {
  name: string;
  min: number;
  max: number;
  components: number;
}

export interface UploadedFrame {
  frame: number;
  file: File;
}