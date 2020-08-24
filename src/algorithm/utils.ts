import { orderBy } from 'lodash';
import {
  Area,
  FullSpecBaseDict,
  FullSpecDict,
  FullSpecListItem,
  Maybe, Spec,
  StudentDict, SuperVolumes,
  University
} from '../types';

export function filterDump(dump: Area[]): Area[] {
  const filteredDump: Area[] = [];
  dump.forEach((area) => {
    const filteredArea: Area = { ...area, universities: [] };
    area.universities.forEach((university) => {
      const filteredUniversity: University = { ...university, specs: [] };
      university.specs.forEach((spec) => {
        const filteredSpec: Spec = { ...spec, students: [] };
        spec.students.forEach((student) => {
          if (student.status !== 'Рекомендовано (б)' && student.status !== 'До наказу (б)') {
            filteredSpec.students.push(student);
          } else {
            filteredSpec.budgetPlaces -= 1;
            const specNumString = filteredSpec.specNum.toString().padStart(3, '0');
            if (specNumString.match(/^12[^1]$/)) {
              SuperVolumes["12*"] -= 1;
            } else if (specNumString.match(/^13.$/)) {
              SuperVolumes["13*"] -= 1;
            } else if (specNumString.match(/^14.$/)) {
              SuperVolumes["14*"] -= 1;
            } else if (specNumString.match(/^17.$/)) {
              SuperVolumes["17*"] -= 1;
            } else if (specNumString.match(/^23.$/)) {
              SuperVolumes["23*"] -= 1;
            } else if (specNumString.match(/^24.$/)) {
              SuperVolumes["24*"] -= 1;
            } else if (specNumString.match(/^29.$/)) {
              SuperVolumes["29*"] -= 1;
            } else {
              // @ts-ignore
              SuperVolumes[specNumString] -= 1;
            }
          }
        });
        filteredUniversity.specs.push(filteredSpec);
      });
      if (filteredUniversity.specs.length) {
        filteredArea.universities.push(filteredUniversity);
      }
    });
    if (filteredArea.universities.length) {
      filteredDump.push(filteredArea);
    }
  });
  return filteredDump;
}

export function getSpecId(url: string): Maybe<number> {
  const match = url.match(/https:\/\/abit-poisk.org.ua\/rate2020\/direction\/(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

export function getSpecDict(dump: Area[]): FullSpecDict {
  const specDict: FullSpecDict = {};
  dump.forEach((area) => {
    area.universities.forEach((university) => {
      university.specs.forEach((spec) => {
        const specId = getSpecId(spec.specUrl);
        if (!specId) {
          return;
        }
        specDict[specId] = {
          ...spec,
          areaName: area.areaName,
          uniName: university.uniName,
        };
      });
    });
  });
  return specDict;
}

export function getStudentDict(dump: Area[]): StudentDict {
  const studentDict: StudentDict = {};
  dump.forEach((area) => {
    area.universities.forEach((university) => {
      university.specs.forEach((spec) => {
        const specId = getSpecId(spec.specUrl);
        if (!specId) {
          return
        }
        spec.students.forEach((student) => {
          if (student.status === 'Скасовано (втрата пріор.)' || student.status === 'Відмова' || student.status === 'Затримано' || !student.priority) {
            return;
          }
          if (!studentDict[student.uid]) {
            studentDict[student.uid] = {
              uid: student.uid,
              name: student.name,
              priorities: [],
            };
          }
          studentDict[student.uid].priorities[student.priority - 1] = {
            specId: specId,
            points: student.points,
            ratingPos: student.ratingPos,
            priority: student.priority,
            isDisabled: student.isDisabled,
          }
        });
      });
    });
  });
  return studentDict;
}

export function getFullSpecBaseDict(specDict: FullSpecDict): FullSpecBaseDict {
  return Object.fromEntries(Object.entries(specDict).map(([id, spec]) => {
    const { students, ...clearedSpecDict } = spec;
    return [id, { ...clearedSpecDict, applications: [] }];
  }))
}

export function getStudentWorklist(studentDict: StudentDict): StudentDict {
  return Object.fromEntries(Object.entries(studentDict).map((([id, student]) => {
    return [id, {
      ...student,
      priorities: student.priorities.filter((prior) => !!prior),
      inList: false,
    }]
  })))
}

export function sortSpecApplicationList(specApplicationList: FullSpecBaseDict): FullSpecBaseDict {
  const specApplicationListClone = { ...specApplicationList };
  Object.keys(specApplicationListClone).forEach((specId) => {
    const numSpecId = parseInt(specId, 10);
    const spec: FullSpecListItem = specApplicationListClone[numSpecId];
    spec.applications = orderBy(spec.applications, ['points', 'priority', 'ratingPos'], ['desc', 'asc', 'asc']);
  });
  return specApplicationListClone;
}
