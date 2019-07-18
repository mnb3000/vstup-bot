import * as fs from 'fs';
import * as path from 'path';
import { orderBy } from 'lodash';
import { Area, FullSpecListItem, PriorityStudent, StudentPriority } from '../types';
import {
  filterDump,
  getFullSpecBaseDict,
  getSpecDict,
  getStudentDict,
  getStudentWorklist,
  sortSpecApplicationList
} from './utils';

async function main() {
  const fullDumpBuffer = await fs.promises.readFile(path.resolve(__dirname, '../../dumps/dump.json'), 'utf-8');
  const fullDump: Area[] = JSON.parse(fullDumpBuffer);
  const filteredDump = filterDump(fullDump, /^12[^1]$/);
  const specDict = getSpecDict(filteredDump);
  const studentDict = getStudentDict(filteredDump);
  let specApplicationList = getFullSpecBaseDict(specDict);
  const studentApplicationList = getStudentWorklist(studentDict);
  let priorityWaitList: PriorityStudent[] = [];
  Object.keys(studentApplicationList).forEach((uid) => {
    const student: StudentPriority = studentApplicationList[uid];
    const firstPriority = student.priorities.shift();
    if (!firstPriority) {
      return;
    }
    const firstPriorityStudent: PriorityStudent = { ...firstPriority, uid, name: student.name };
    priorityWaitList.push(firstPriorityStudent);
  });
  priorityWaitList.forEach((prior) => {
    studentApplicationList[prior.uid].inList = true;
    specApplicationList[prior.specId].applications.push(prior);
  });
  priorityWaitList = [];
  let areApplicationsRemovedSuper = true;
  while (areApplicationsRemovedSuper) {
    console.log('Iterating Super Volume...');
    areApplicationsRemovedSuper = false;
    let areApplicationsRemovedMaxVolume = true;
    while (areApplicationsRemovedMaxVolume) {
      console.log('Iterating Max Volume...');
      areApplicationsRemovedMaxVolume = false;
      specApplicationList = sortSpecApplicationList(specApplicationList);
      Object.keys(specApplicationList).forEach((specId) => {
        const numSpecId = parseInt(specId, 10);
        const spec: FullSpecListItem = specApplicationList[numSpecId];
        const deletedApplications = spec.applications.splice(spec.budgetPlaces, Infinity);
        if (deletedApplications.length) {
          areApplicationsRemovedMaxVolume = true;
        }
        deletedApplications.forEach((application) => {
          const student = studentApplicationList[application.uid];
          student.inList = false;
          const nextPriority =  student.priorities.shift();
          if (nextPriority) {
            priorityWaitList.push({ ...nextPriority, uid: student.uid, name: student.name });
          } else {
            delete studentApplicationList[application.uid];
          }
        });
      });
      priorityWaitList.forEach((prior) => {
        studentApplicationList[prior.uid].inList = true;
        specApplicationList[prior.specId].applications.push(prior);
      });
      priorityWaitList = [];
    }
    const superList = orderBy(Object.keys(specApplicationList).map(specId => {
      const numSpecId = parseInt(specId, 10);
      const spec: FullSpecListItem = specApplicationList[numSpecId];
      return spec.applications
    }).flat(), ['points', 'priority', 'ratingPos'], ['desc', 'asc', 'asc']);
    const deletedApplications = superList.splice(5176, Infinity);
    if (deletedApplications.length) {
      areApplicationsRemovedSuper = true;
    }
    deletedApplications.forEach((application) => {
      const spec = specApplicationList[application.specId];
      const appIndex = spec.applications.findIndex(app => app.uid === application.uid);
      spec.applications.splice(appIndex, 1);
      const student = studentApplicationList[application.uid];
      student.inList = false;
      const nextPriority =  student.priorities.shift();
      if (nextPriority) {
        priorityWaitList.push({ ...nextPriority, uid: student.uid, name: student.name });
      } else {
        delete studentApplicationList[application.uid];
      }
    });
    priorityWaitList.forEach((prior) => {
      studentApplicationList[prior.uid].inList = true;
      specApplicationList[prior.specId].applications.push(prior);
    });
    priorityWaitList = [];
  }
  const dumpFolderPath = path.resolve(__dirname, '../../dumps');
  try {
    await fs.promises.access(dumpFolderPath);
  } catch (e) {
    await fs.promises.mkdir(dumpFolderPath);
  }
  const filenameSpecs = `ALGO_SPECS_${Date.now()}.json`;
  const filenameStudents = `ALGO_STUDENTS_${Date.now()}.json`;
  fs.writeFileSync(path.resolve(dumpFolderPath, filenameSpecs), JSON.stringify(specApplicationList));
  console.log(`Saved to dumps/${filenameSpecs}`);
  fs.writeFileSync(path.resolve(dumpFolderPath, filenameStudents), JSON.stringify(studentApplicationList));
  console.log(`Saved to dumps/${filenameStudents}`);
}

main()
  .catch((e) => console.log(e));
