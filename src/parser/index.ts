import * as fs from 'fs';
import * as path from 'path';
import { getAllAreas } from './utils';

async function main() {
  const result = await getAllAreas();
  const dumpFolderPath = path.resolve(__dirname, '../../dumps');
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
