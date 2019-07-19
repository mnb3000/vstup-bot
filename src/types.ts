type StudentStatus = 'Зареєстровано' | 'Допущено' | 'Скасовано (втрата пріор.)' | 'Заява надійшла з сайту' | 'Затримано';

export const superVolumeKeys = <const> [
  '101', '102', '103', '104', '105', '106', '111',
  '112', '113', '121', '151', '152', '153', '161',
  '162', '163', '181', '182', '183', '184', '185',
  '186', '187', '192', '193', '194', '201', '202',
  '203', '204', '205', '206', '207', '208', '224',
  '226', '227', '229', '261', '263', '271', '272',
  '273', '274', '275', '281', '291', '292', '293',
  '12*', '13*', '14*', '17*', '23*', '24*', '07*',
  '012', '013', '014', '015', '021', '027', '028',
  '029', '031', '032', '033', '034', '035', '051',
  '052', '053', '054', '061', '081', '091',
];

export type SuperVolumeKeys = typeof superVolumeKeys[number];

export const SuperVolumes: Record<SuperVolumeKeys, number> = {
  '121': 1196,
  '12*': 5176,
  '13*': 1710,
  '14*': 1476,
  '17*': 1118,
  '23*': 540,
  '24*': 385,
  '07*': 3143,
  '101': 639,
  '102': 367,
  '103': 324,
  '104': 302,
  '105': 343,
  '106': 170,
  '111': 365,
  '112': 80,
  '113': 571,
  '151': 1097,
  '152': 239,
  '153': 230,
  '161': 542,
  '162': 330,
  '163': 85,
  '181': 675,
  '182': 115,
  '183': 95,
  '184': 290,
  '185': 141,
  '186': 185,
  '187': 55,
  '192': 1218,
  '193': 485,
  '194': 55,
  '201': 775,
  '202': 110,
  '203': 55,
  '204': 455,
  '205': 195,
  '206': 105,
  '207': 75,
  '208': 465,
  '224': 15,
  '226': 10,
  '227': 39,
  '229': 5,
  '261': 10,
  '263': 23,
  '271': 384,
  '272': 182,
  '273': 65,
  '274': 329,
  '275': 758,
  '281': 100,
  '291': 100,
  '292': 173,
  '293': 190,
  '012': 565,
  '013': 784,
  '014': 4986,
  '015': 408,
  '021': 12,
  '027': 30,
  '028': 10,
  '029': 155,
  '031': 20,
  '032': 349,
  '033': 120,
  '034': 70,
  '035': 1831,
  '051': 864,
  '052': 110,
  '053': 628,
  '054': 185,
  '061': 290,
  '081': 1599,
  '091': 545
};

export const SuperVolumeFilters: Record<SuperVolumeKeys, RegExp> = {
  '121': /^121$/,
  '12*': /^12[^1]$/,
  '13*': /^13.$/,
  '14*': /^14.$/,
  '17*': /^17.$/,
  '23*': /^23.$/,
  '24*': /^24.$/,
  '07*': /^7.$/,
  '101': /^101$/,
  '102': /^102$/,
  '103': /^103$/,
  '104': /^104$/,
  '105': /^105$/,
  '106': /^106$/,
  '111': /^111$/,
  '112': /^112$/,
  '113': /^113$/,
  '151': /^151$/,
  '152': /^152$/,
  '153': /^153$/,
  '161': /^161$/,
  '162': /^162$/,
  '163': /^163$/,
  '181': /^181$/,
  '182': /^182$/,
  '183': /^183$/,
  '184': /^184$/,
  '185': /^185$/,
  '186': /^186$/,
  '187': /^187$/,
  '192': /^192$/,
  '193': /^193$/,
  '194': /^194$/,
  '201': /^201$/,
  '202': /^202$/,
  '203': /^203$/,
  '204': /^204$/,
  '205': /^205$/,
  '206': /^206$/,
  '207': /^207$/,
  '208': /^208$/,
  '224': /^224$/,
  '226': /^226$/,
  '227': /^227$/,
  '229': /^229$/,
  '261': /^261$/,
  '263': /^263$/,
  '271': /^271$/,
  '272': /^272$/,
  '273': /^273$/,
  '274': /^274$/,
  '275': /^275$/,
  '281': /^281$/,
  '291': /^291$/,
  '292': /^292$/,
  '293': /^293$/,
  '012': /^12$/,
  '013': /^13$/,
  '014': /^14$/,
  '015': /^15$/,
  '021': /^21$/,
  '027': /^27$/,
  '028': /^28$/,
  '029': /^29$/,
  '031': /^31$/,
  '032': /^32$/,
  '033': /^33$/,
  '034': /^34$/,
  '035': /^35$/,
  '051': /^52$/,
  '052': /^52$/,
  '053': /^53$/,
  '054': /^54$/,
  '061': /^61$/,
  '081': /^81$/,
  '091': /^91$/,
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
