import * as fs from 'fs';
import * as path from 'path';
import Excel, { PaperSize } from 'exceljs';
import { orderBy } from 'lodash';
import { Area, FullStudent } from '../types';

async function main() {
  const dumpBuffer = await fs.promises.readFile(path.resolve(__dirname, '../../dumps/dump.json'), 'utf-8');
  const dump: Area[] = JSON.parse(dumpBuffer);
  const list: FullStudent[] = [];
  dump.forEach((area) => {
    area.universities.forEach((university) => {
      university.specs.forEach((spec) => {
        if (spec.specNum.toString().length !== 3 ||
          spec.specNum.toString().substr(0, 2) !== '12' ||
          spec.specNum === 121) {
          return;
        }
        spec.students.forEach((student) => {
          if (!student.priority || student.status !== 'Допущено') {
            return;
          }
          list.push({
            ...student,
            specUrl: spec.specUrl,
            specNum: spec.specNum,
            uniName: university.uniName,
            faculty: spec.faculty,
            areaName: area.areaName,
          })
        })
      })
    });
  });
  const result: FullStudent[] = orderBy(list, ['points', 'priority'], ['desc', 'asc'])
    .map((student, i) => ({...student, pos: i + 1}));
  const workbook = new Excel.Workbook();
  const sheet = workbook.addWorksheet('List', {
    pageSetup: {
      paperSize: PaperSize.A4,
      orientation: 'landscape',
    }
  });
  sheet.columns = [
    {
      header: '№',
      key: 'pos',
      width: 8,
    },
    {
      header: 'ФИО',
      key: 'name',
      width: 20,
    },
    {
      header: 'КБ',
      key: 'points',
      width: 6,
    },
    {
      header: 'Приор',
      key: 'priority',
      width: 10,
    },
    {
      header: 'Область',
      key: 'areaName',
      width: 15,
    },
    {
      header: 'Универ',
      key: 'uniName',
      width: 30,
    },
    {
      header: 'Факультет',
      key: 'faculty',
      width: 25,
    },
    {
      header: 'Спец',
      key: 'specNum',
      width: 6,
    },
    {
      header: 'Квота',
      key: 'isDisabled',
      width: 6,
    },
  ];
  sheet.addRows(result.map((student) => ({
    ...student,
    specNum: {
      text: student.specNum,
      hyperlink: student.specUrl
    }
  })));
  const dumpFolderPath = path.resolve(__dirname, '../../dumps');
  try {
    await fs.promises.access(dumpFolderPath);
  } catch (e) {
    await fs.promises.mkdir(dumpFolderPath);
  }
  const filename = `wide_${Date.now()}`;
  fs.writeFileSync(path.resolve(dumpFolderPath, `${filename}.json`), JSON.stringify(result));
  console.log(`Saved to dumps/${filename}.json`);
  await workbook.xlsx.writeFile(path.resolve(dumpFolderPath, `${filename}.xlsx`));
  console.log(`Saved to dumps/${filename}.xlsx`);
}

main()
  .catch((e) => console.log(e));
