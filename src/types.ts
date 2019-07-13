type StudentStatus = 'Зареєстровано' | 'Допущено' | 'Скасовано (втрата пріор.)' | 'Заява надійшла з сайту' | 'Затримано'

export interface Student {
  ratingPos: number,
  name: string,
  priority: number,
  points: number,
  status: StudentStatus,
  isDisabled: boolean,
}

export interface Spec {
  specUrl: string,
  specNum: number,
  faculty: string,
  budgetPlaces: number,
  students: Student[],
}

export interface University {
  uniUrl: string,
  uniName: string,
  specs: Spec[],
}

export interface Area {
  areaUrl: string,
  areaName: string,
  universities: University[],
}
