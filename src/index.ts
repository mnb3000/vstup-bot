import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { getUniversity } from './utils';

dotenv.config();

async function main() {
  const result = await getUniversity('https://abit-poisk.org.ua/rate2019/univer/174');
  const dumpFolderPath = path.resolve(__dirname, '../dumps');
  try {
    await fs.promises.access(dumpFolderPath);
  } catch (e) {
    await fs.promises.mkdir(dumpFolderPath);
  }
  fs.writeFileSync(path.resolve(dumpFolderPath, `${Date.now()}.json`), JSON.stringify(result));
}

main()
  .catch((e) => console.log(e));
