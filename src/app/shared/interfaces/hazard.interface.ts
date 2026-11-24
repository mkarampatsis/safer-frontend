export interface Hazard {
  type: string
  scenario: Scenario
}

export interface Scenario {
  name: string
  scenarions: Scenarios[]
}

export interface Scenarios {
  name: string
  animation: string
}

export interface SelectedHazard {
  hazard: string;
  scenario: Scenarios;
}