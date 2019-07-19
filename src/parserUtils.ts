import { JSDOM } from 'jsdom';
import * as crypto from 'crypto';
import batchPromises from 'batch-promises';
import { Area, Spec, Student, University } from './types';

function parseStudents(document: Document): Student[] {
  const table = document.querySelectorAll('table').item(0);
  if (!table || !document.querySelector('.table-responsive>table')) {
    console.log('EMPTY!');
    return []
  }
  const tableRows = table.tBodies.item(0)!.rows;
  const students: Student[] = [];
  for (let row of Array.from(tableRows)) {
    const { cells } = row;
    if (!cells.item(1) || cells.item(1)!.textContent === 'ПІБ') continue;
    const ratingPos = parseInt(cells.item(0)!.textContent!
      .replace(/\n/g, '')
      .trim(), 10);
    const name = cells.item(1)!.textContent!.replace(/\n/g, '').trim();
    const priority = parseInt(cells.item(2)!.textContent!, 10);
    const points = parseFloat(cells.item(3)!.textContent!);
    const status = cells.item(4)!.textContent!;
    const znoPts = cells.item(5)!.children.item(0);
    const ukrPts = znoPts ? znoPts.children.item(0)!.textContent! : 100;
    const isDisabled = cells.item(6)!.textContent!.includes('Квота');
    students.push(<Student>{
      uid: crypto.createHash('sha1').update(name + ukrPts).digest('hex'),
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

async function getSpecStudentsPage(specUrl: string, page: number): Promise<Student[]> {
  if (!specUrl.includes('https://abit-poisk.org.ua/rate2019/direction/')) {
    throw new Error('Provided link is not valid!');
  }
  const dom = await JSDOM.fromURL(`${specUrl}?page=${page}`);
  const { document } = dom.window;
  return parseStudents(document);
}

async function getSpec(specUrl: string): Promise<Spec> {
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
  const allPlacesText = document.querySelector('.font300')!.textContent!;
  const budgetPlaces = parseInt(allPlacesText.split('БМmax')[1] || allPlacesText.split('БМ')[1], 10);
  console.log(`${faculty}: ${specNum}\n${specUrl}`);
  let students: Student[] = parseStudents(document);
  if (pageCount > 1) {
    const pagePromises: Promise<Student[]>[] = [];
    for (let i = 2; i <= pageCount; i++) {
      pagePromises.push(getSpecStudentsPage(specUrl, i));
    }
    const pages = await Promise.all(pagePromises);
    students = [...students, ...pages.flat()]
  }
  return {
    specUrl,
    specNum,
    faculty,
    budgetPlaces,
    students,
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
  console.log(`\n${uniName}: ${uniUrl}\n`);
  const table = document.querySelector('table');
  if (!table) {
    return {
      uniUrl,
      uniName,
      specs: [],
    }
  }
  const tableRows = Array.from(document.querySelector('table')!.rows).filter((row) => {
    const { cells } = row;
    return !(cells.item(0)!.attributes.getNamedItem('data-stooltip') === null ||
      cells.item(0)!.attributes.getNamedItem('data-stooltip')!.value !==
      'Бакалавр (на основі:Повна загальна середня освіта)' ||
      !cells.item(2)!.textContent!.includes('max') ||
      !parseInt(cells.item(2)!.textContent!, 10));
  });
  const specs: Spec[] = await batchPromises<HTMLTableRowElement, Spec>(3, tableRows, (row) => {
    const { cells } = row;
    const specUrl = `https://abit-poisk.org.ua${cells.item(5)!.children.item(0)!.getAttribute('href')!}`;
    return getSpec(specUrl);
  });
  return {
    uniUrl,
    uniName,
    specs,
  };
}

async function getArea(areaUrl: string): Promise<Area> {
  if (!areaUrl.includes('https://abit-poisk.org.ua/rate2019/region/')) {
    throw new Error('Provided link is not valid!');
  }
  const dom = await JSDOM.fromURL(areaUrl);
  const { document } = dom.window;
  const areaName = document.querySelector('h1')!.textContent!.replace('ВНЗ у ', '');
  console.log(`\n\n${areaName}: ${areaUrl}\n\n`);
  const tableRows = document.querySelector('table')!.tBodies.item(0)!.rows;
  const universities: University[] = [];
  for (let row of Array.from(tableRows).slice(0, -1)) {
    const { cells } = row;
    const budgetPlaces = cells.item(1) ? parseInt(cells.item(1)!.textContent!, 10) : 0;
    if (!budgetPlaces) {
      continue;
    }
    const uniUrl = `https://abit-poisk.org.ua${cells.item(0)!.children.item(0)!.getAttribute('href')!}`;
    universities.push(await getUniversity(uniUrl));
  }
  return {
    areaUrl,
    areaName,
    universities,
  }
}

export async function getAllAreas(): Promise<Area[]> {
  const dom = await JSDOM.fromURL('https://abit-poisk.org.ua/rate2019/');
  const { document } = dom.window;
  const tableRows = document.querySelector('table')!.tBodies.item(0)!.rows;
  const areas: Area[] = [];
  for (let row of Array.from(tableRows).slice(0, -1)) {
    const { cells } = row;
    const areaUrl = `https://abit-poisk.org.ua${cells.item(0)!.children.item(0)!.getAttribute('href')!}`;
    areas.push(await getArea(areaUrl));
  }
  return areas;
}
