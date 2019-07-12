import { JSDOM } from 'jsdom';
import { Spec, Student, University } from './types';

export async function getSpecStudentsPage(specUrl: string, page: number): Promise<Student[]> {
  if (!specUrl.includes('https://abit-poisk.org.ua/rate2019/direction/')) {
    throw new Error('Provided link is not valid!');
  }
  const dom = await JSDOM.fromURL(`${specUrl}?page=${page}`);
  const { document } = dom.window;
  const tableRows = document.querySelectorAll('table').item(0).tBodies.item(0)!.rows;
  const students: Student[] = [];
  for (let row of Array.from(tableRows)) {
    const { cells } = row;
    if (cells.item(1)!.textContent === 'ПІБ') continue;
    const ratingPos = parseInt(cells.item(0)!.textContent!
      .replace(/\n/g, '')
      .trim(), 10);
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
    });
  }
  return students;
}

export async function getSpec(specUrl: string): Promise<Spec> {
  if (!specUrl.includes('https://abit-poisk.org.ua/rate2019/direction/')) {
    throw new Error('Provided link is not valid!');
  }
  const dom = await JSDOM.fromURL(specUrl);
  const { document } = dom.window;
  const paginator = document.querySelector('.card .card-header .content-left');
  const pageCount = paginator ? paginator.childElementCount - 1 : 1;
  const specNum = parseInt(document.querySelector('h2')!.textContent!, 10);
  const faculty = document.querySelector('.subhead-2')!.textContent!
    .split('•')[0]
    .replace(/\n/g, '')
    .trim();
  const budgetPlaces = parseInt(document.querySelector('.font300')!.textContent!
    .split('БМmax')[1], 10);
  let students: Student[] = [];
  for (let i = 1; i <= pageCount; i++) {
    students = [...students, ...(await getSpecStudentsPage(specUrl, i))]
  }
  return {
    specNum,
    faculty,
    budgetPlaces,
    students
  };
}

export async function getUniversity(uniUrl: string): Promise<University> {
  if (!uniUrl.includes('https://abit-poisk.org.ua/rate2019/univer/')) {
    throw new Error('Provided link is not valid!');
  }
  const dom = await JSDOM.fromURL(uniUrl);
  const { document } = dom.window;
  const uniName = document.querySelector('h2')!.textContent!
    .replace(/\n/g, '')
    .trim();
  const tableRows = document.querySelector('table')!.rows;
  // @ts-ignore
  const specs: Spec[] = [];
  for (let row of Array.from(tableRows)) {
    const { cells } = row;
    if (cells.item(0)!.attributes.getNamedItem('data-stooltip') === null) {
      continue;
    }
    if (cells.item(0)!.attributes.getNamedItem('data-stooltip')!.value !== 'Бакалавр (на основі:Повна загальна середня освіта)') {
      continue;
    }
    const specUrl = `https://abit-poisk.org.ua${cells.item(5)!.children.item(0)!.getAttribute('href')!}`;
    specs.push(await getSpec(specUrl));
  }
  return {
    uniName,
    specs
  };
}
