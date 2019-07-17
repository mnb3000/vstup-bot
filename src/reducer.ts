import * as fs from 'fs';
import * as path from 'path';
import { StudentDict, University } from './types';

async function main() {
  const dumpBuffer = await fs.promises.readFile(path.resolve(__dirname, '../dumps/kpi.json'), 'utf-8');
  const dump: University = JSON.parse(dumpBuffer);
  const reducedDump: StudentDict = {};
  dump.specs.forEach((spec) => {
    spec.students.forEach((student) => {
      if (!reducedDump[student.uid]) {
        reducedDump[student.uid] = {
          uid: student.uid,
          name: student.name,
          priorities: [],
        };
      }
      if (student.status !== 'Допущено') {
        return;
      }
      reducedDump[student.uid].priorities[student.priority - 1] = {
        areaName: 'м. Київ',
        uniName: dump.uniName,
        specUrl: spec.specUrl,
        specNum: spec.specNum,
        faculty: spec.faculty,
        budgetPlaces: spec.budgetPlaces,
        points: student.points,
        ratingPos: student.ratingPos,
        isDisabled: student.isDisabled,
      }
    });
  });
  const dumpFolderPath = path.resolve(__dirname, '../dumps');
  try {
    await fs.promises.access(dumpFolderPath);
  } catch (e) {
    await fs.promises.mkdir(dumpFolderPath);
  }
  const filename = `reduced_${Date.now()}.json`;
  fs.writeFileSync(path.resolve(dumpFolderPath, filename), JSON.stringify(reducedDump));
  console.log(`Saved to dumps/${filename}`);
}

main()
  .catch((e) => console.log(e));
