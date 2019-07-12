import * as dotenv from "dotenv";
import { getSpecStudentList } from './utils';

dotenv.config();

async function main() {
  const result = await getSpecStudentList('https://abit-poisk.org.ua/rate2019/direction/555585');
  console.log(result);
}

main()
  .catch((e) => console.log(e));
