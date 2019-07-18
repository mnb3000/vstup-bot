import * as fs from 'fs';
import * as path from 'path';
import { Area, StudentDict,  } from './types';
import { getSpecId } from './algorithm/utils';

async function main() {
  const dumpBuffer = await fs.promises.readFile(path.resolve(__dirname, '../dumps/dump.json'), 'utf-8');
  const dump: Area[] = JSON.parse(dumpBuffer);
  const reducedDump: StudentDict = {};
  dump.forEach((area) => {
    area.universities.forEach((university) => {
      university.specs.forEach((spec) => {
        const specId = getSpecId(spec.specUrl);
        if (!specId) {
          return
        }
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
