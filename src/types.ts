export interface Area {
  areaUrl: string,
  areaName: string,
  universities: University[],
}

export interface University {
  uniUrl: string,
  uniName: string,
  specs: Spec[],
}

export interface Spec {
  specUrl: string,
  specNum: number,
  faculty: string,
  budgetPlaces: number,
  students: Student[],
}

export interface Student {
  ratingPos: number,
  name: string,
  priority: number,
  points: number,
  status: string,
  isDisabled: boolean,
}
