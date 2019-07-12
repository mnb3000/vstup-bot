import * as dotenv from "dotenv";
import { getStudentList } from './utils';

dotenv.config();

async function main() {
  const result = await getStudentList('http://vstup.info/2019/174/i2019i174p555585.html');
  console.log(result)
}

main()
  .catch((e) => console.log(e));
