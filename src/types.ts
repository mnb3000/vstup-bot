export interface University {
  uniName: string,
}

export interface Spec extends University {
  specNum: number,
  faculty: string,
  budgetPlaces: number,
}

export interface Student extends Spec {
  ratingPos: number,
  name: string,
  priority: number,
  points: number,
  status: string,
  isDisabled: boolean,
}
