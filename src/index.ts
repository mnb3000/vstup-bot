import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { getArea, getUniversity } from './utils';

dotenv.config();

async function main() {
  // const result = await getUniversity('https://abit-poisk.org.ua/rate2019/univer/194');
  const result = await getArea('https://abit-poisk.org.ua/rate2019/region/27');
  const dumpFolderPath = path.resolve(__dirname, '../dumps');
  try {
    await fs.promises.access(dumpFolderPath);
  } catch (e) {
    await fs.promises.mkdir(dumpFolderPath);
  }
  const filename = `${Date.now()}.json`;
  fs.writeFileSync(path.resolve(dumpFolderPath, filename), JSON.stringify(result));
  console.log(`Saved to dumps/${filename}`);
}

main()
  .catch((e) => console.log(e));
