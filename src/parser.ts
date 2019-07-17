import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { getAllAreas, getUniversity } from './parserUtils';

dotenv.config();

async function main() {
  // const result = await getUniversity('https://abit-poisk.org.ua/rate2019/univer/174');
  const result = await getAllAreas();
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
