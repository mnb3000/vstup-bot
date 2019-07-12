import { JSDOM } from 'jsdom';
import { Student, Spec } from './types';

export async function getSpecStudentPage(specUrl: string, spec: Spec, page: number): Promise<Student[]> {
  if (!specUrl.includes('https://abit-poisk.org.ua/rate2019/')) {
    throw new Error('Provided link is not valid!')
  }
  const dom = await JSDOM.fromURL(`${specUrl}?page=${page}`);
  const { document } = dom.window;
  const tableRows = document.querySelectorAll('table').item(0).tBodies.item(0)!.rows;
  const students: Student[] = [];
  for (let row of Array.from(tableRows)) {
    const { cells } = row;
    if (cells.item(1)!.textContent === 'ПІБ') continue;
    const ratingPos = parseInt(cells.item(0)!.textContent!.replace(/\n/g, '').trim(), 10);
    const name = cells.item(1)!.textContent!.replace(/\n/g, '').trim();
    const priority = parseInt(cells.item(2)!.textContent!, 10);
    const points = parseFloat(cells.item(3)!.textContent!);
    const status = cells.item(4)!.textContent!;
    const isDisabled = cells.item(6)!.textContent!.includes('Квота');
    students.push({
      ratingPos,
      name,
      priority: isNaN(priority) ? 0 : priority,
      points,
      status,
      isDisabled,
      ...spec
    });
  }
  return students;
}

export async function getSpecStudentList(specUrl: string, spec: Spec): Promise<Student[]> {
  if (!specUrl.includes('https://abit-poisk.org.ua/rate2019/')) {
    throw new Error('Provided link is not valid!')
  }
  const dom = await JSDOM.fromURL(specUrl);
  const { document } = dom.window;
  const paginator = document.querySelector('.card .card-header .content-left');
  const pageCount = paginator ? paginator.childElementCount - 1 : 1;
  let list: Student[] = [];
  for (let i = 1; i <= pageCount; i++) {
    list = [...list, ...(await getSpecStudentPage(specUrl, spec, i))]
  }
  return list;
}

export async function getBachelorLinkList(uniUrl: string) {
  if (!uniUrl.includes('https://abit-poisk.org.ua/rate2019/')) {
    throw new Error('Provided link is not valid!');
  }
  const dom = await JSDOM.fromURL(uniUrl);
  const { document } = dom.window;
  const tableRows = document.querySelectorAll('table').item(1).rows;
}
