type StudentStatus = 'Зареєстровано' | 'Допущено' | 'Скасовано (втрата пріор.)' | 'Заява надійшла з сайту' | 'Затримано';

export const superVolumeKeys = <const> ['121', '12*'];

export type SuperVolumeKeys = typeof superVolumeKeys[number];

export const SuperVolumes: Record<SuperVolumeKeys, number> = {
  '12*': 5176,
  '121': 1196,
};

export const SuperVolumeFilters: Record<SuperVolumeKeys, RegExp> = {
  '12*': /^12[^1]$/,
  '121': /^121$/,
};

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

export interface FullStudent extends Student {
  pos?: number,
  specUrl: string,
  specNum: number,
  areaName: string,
  faculty: string,
  uniName: string,
}

export interface Priority {
  specId: number,
  points: number,
  ratingPos: number,
  priority: number,
  isDisabled: boolean,
}

export interface StudentPriority {
  uid: string,
  name: string,
  priorities: Priority[],
  inList?: boolean,
}

export interface PriorityStudent extends Priority {
  uid: string,
  name: string,
}

export interface StudentDict {
  [uid: string]: StudentPriority,
}

export interface SpecBase {
  specUrl: string,
  specNum: number,
  faculty: string,
  budgetPlaces: number,
}

export interface Spec extends SpecBase {
  students: Student[],
}

export interface FullSpecListItem extends SpecBase {
  areaName: string,
  uniName: string,
  applications: PriorityStudent[],
}

export interface FullSpec extends Spec {
  areaName: string,
  uniName: string,
}

export interface FullSpecBaseDict {
  [id: number]: FullSpecListItem,
}

export interface FullSpecDict {
  [id: number]: FullSpec,
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
