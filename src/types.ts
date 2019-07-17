type StudentStatus = 'Зареєстровано' | 'Допущено' | 'Скасовано (втрата пріор.)' | 'Заява надійшла з сайту' | 'Затримано'

export type Maybe<T> = T | void;

export interface Student {
  uid: string,
  ratingPos: number,
  name: string,
  priority: number,
  points: number,
  status: StudentStatus,
  isDisabled: boolean,
}

export interface FullStudent {
  pos?: number,
  uid: string,
  ratingPos: number,
  name: string,
  priority: number,
  points: number,
  status: StudentStatus,
  isDisabled: boolean,
  specUrl: string,
  specNum: number,
  areaName: string,
  faculty: string,
  uniName: string,
}

export interface Priority {
  areaName: string,
  specUrl: string,
  specNum: number,
  faculty: string,
  budgetPlaces: number,
  uniName: string,
  points: number,
  ratingPos: number,
  isDisabled: boolean,
}

export interface Priorities {
  [pos: number]: Priority,
}

export interface PriorityStudent {
  uid: string,
  name: string,
  priorities: Priorities,
}

export interface StudentDict {
  [uid: string]: PriorityStudent,
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
