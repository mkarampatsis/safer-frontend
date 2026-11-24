export interface Site {
  site: string
  locations: Location[]
}

export interface Location {
  location: string
  areas: string[]
}

export interface SelectedSite {
  site: string;
  location: string;
  area: string;
}