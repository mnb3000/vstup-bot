type StudentStatus = 'Зареєстровано' | 'Допущено' | 'Скасовано (втрата пріор.)' | 'Заява надійшла з сайту' | 'Затримано' | 'Рекомендовано (б)';

export const superVolumeKeys = <const> [
  '101', '102', '103', '104', '105', '106', '111',
  '112', '113', '121', '151', '152', '153', '161',
  '162', '163', '181', '182', '183', '184', '185',
  '186', '187', '191', '192', '193', '194', '201',
  '202', '203', '204', '205', '206', '207', '208',
  '223', '224', '226', '227', '229', '251', '252',
  '253', '254', '255', '261', '262', '263', '271',
  '272', '273', '274', '275', '281', '12*', '13*',
  '14*', '17*', '23*', '24*', '29*', '012', '013',
  '014', '015', '016', '017', '021', '022', '023',
  '024', '025', '026', '027', '028', '029', '031',
  '032', '033', '034', '035', '051', '052', '053',
  '054', '061', '071', '072', '073', '075', '076',
  '081', '091'
];

export type SuperVolumeKeys = typeof superVolumeKeys[number];

export const SuperVolumes: Record<SuperVolumeKeys, number> = {
  '121': 2600,
  '12*': 8604,
  '13*': 4465,
  '14*': 3624,
  '17*': 2351,
  '23*': 700,
  '24*': 310,
  '29*': 477,
  '101': 800,
  '102': 450,
  '103': 400,
  '104': 355,
  '105': 405,
  '106': 185,
  '111': 400,
  '112': 100,
  '113': 680,
  '151': 1800,
  '152': 410,
  '153': 325,
  '161': 811,
  '162': 410,
  '163': 145,
  '181': 1140,
  '182': 220,
  '183': 220,
  '184': 550,
  '185': 240,
  '186': 285,
  '187': 90,
  '191': 557,
  '192': 2325,
  '193': 720,
  '194': 80,
  '201': 1355,
  '202': 205,
  '203': 95,
  '204': 700,
  '205': 430,
  '206': 190,
  '207': 115,
  '208': 1300,
  '223': 65,
  '224': 45,
  '226': 55,
  '227': 335,
  '229': 10,
  '251': 127,
  '252': 180,
  '253': 931,
  '254': 486,
  '255': 411,
  '261': 279,
  '262': 2250,
  '263': 205,
  '271': 440,
  '272': 399,
  '273': 340,
  '274': 725,
  '275': 1101,
  '281': 100,
  '012': 915,
  '013': 1205,
  '014': 6745,
  '015': 730,
  '016': 380,
  '017': 1040,
  '021': 227,
  '022': 703,
  '023': 650,
  '024': 187,
  '025': 620,
  '026': 228,
  '027': 65,
  '028': 130,
  '029': 370,
  '031': 20,
  '032': 410,
  '033': 125,
  '034': 162,
  '035': 2337,
  '051': 1230,
  '052': 158,
  '053': 694,
  '054': 200,
  '061': 256,
  '071': 950,
  '072': 1158,
  '073': 1130,
  '075': 400,
  '076': 480,
  '081': 2916,
  '091': 640,
};

export const SuperVolumeFilters: Record<SuperVolumeKeys, RegExp> = {
  '121': /^121$/,
  '12*': /^12[^1]$/,
  '13*': /^13.$/,
  '14*': /^14.$/,
  '17*': /^17.$/,
  '23*': /^23.$/,
  '24*': /^24.$/,
  '29*': /^29.$/,
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
  '191': /^191$/,
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
  '223': /^223$/,
  '224': /^224$/,
  '226': /^226$/,
  '227': /^227$/,
  '229': /^229$/,
  '251': /^251$/,
  '252': /^252$/,
  '253': /^253$/,
  '254': /^254$/,
  '255': /^255$/,
  '261': /^261$/,
  '262': /^262$/,
  '263': /^263$/,
  '271': /^271$/,
  '272': /^272$/,
  '273': /^273$/,
  '274': /^274$/,
  '275': /^275$/,
  '281': /^281$/,
  '012': /^12$/,
  '013': /^13$/,
  '014': /^14$/,
  '015': /^15$/,
  '016': /^16$/,
  '017': /^17$/,
  '021': /^21$/,
  '022': /^22$/,
  '023': /^23$/,
  '024': /^24$/,
  '025': /^25$/,
  '026': /^26$/,
  '027': /^27$/,
  '028': /^28$/,
  '029': /^29$/,
  '031': /^31$/,
  '032': /^32$/,
  '033': /^33$/,
  '034': /^34$/,
  '035': /^35$/,
  '051': /^51$/,
  '052': /^52$/,
  '053': /^53$/,
  '054': /^54$/,
  '061': /^61$/,
  '071': /^71$/,
  '072': /^72$/,
  '073': /^73$/,
  '075': /^75$/,
  '076': /^76$/,
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

export interface SearchPriorityStudent extends PriorityStudent {
  searchName: string,
  budgetPlaceRatingPos: number,
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
