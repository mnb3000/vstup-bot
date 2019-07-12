import * as dotenv from "dotenv";
// import { getSpec } from './utils';
import { getUniversity } from './utils';

dotenv.config();

async function main() {
  // const result = await getSpec('https://abit-poisk.org.ua/rate2019/direction/555585');
  const result = await getUniversity('https://abit-poisk.org.ua/rate2019/univer/174');
  console.log(result);
}

main()
  .catch((e) => console.log(e));
