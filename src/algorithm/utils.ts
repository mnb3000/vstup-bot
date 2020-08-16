import { orderBy } from 'lodash';
import {
  Area,
  FullSpecBaseDict,
  FullSpecDict,
  FullSpecListItem,
  Maybe,
  StudentDict,
  University
} from '../types';

export function filterDump(dump: Area[], regexFilter: RegExp): Area[] {
  const filteredDump: Area[] = [];
  dump.forEach((area) => {
    const filteredArea: Area = { ...area, universities: [] };
    area.universities.forEach((university) => {
      const filteredUniversity: University = { ...university, specs: [] };
      university.specs.forEach((spec) => {
        if (spec.specNum.toString().match(regexFilter)) {
          filteredUniversity.specs.push(spec);
        }
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
          if (student.status !== 'Допущено' || !student.priority) {
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
