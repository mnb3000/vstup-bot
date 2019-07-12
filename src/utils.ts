import { JSDOM } from 'jsdom';
import { Student } from './types';

export async function getStudentList(url: string) {
  if (!url.includes('http://vstup.info/2019/')) {
    throw new Error('Provided link is not valid!')
  }
  const dom = await JSDOM.fromURL(url);
  const { document } = dom.window;
  const tableRows = document.querySelectorAll('table').item(0).rows;
  const students: Student[] = [];
  for (let row of Array.from(tableRows)) {
    const { cells } = row;
    if (cells.item(1)!.textContent === 'ПІБ') continue;
    const name = cells.item(1)!.textContent!.replace(/\n/g, '').trim();
    const priority = parseInt(cells.item(2)!.textContent!, 10);
    const points = parseFloat(cells.item(3)!.textContent!);
    const status = cells.item(4)!.textContent!;
    const isDisabled = cells.item(6)!.textContent!.includes('Квота');
    students.push({
      name,
      priority: isNaN(priority) ? 0 : priority,
      points,
      status,
      isDisabled
    });
  }
  return students;
}
