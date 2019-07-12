export interface University {
  uniName: string,
  specs: Spec[]
}

export interface Spec {
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
