import TelegramBot from 'node-telegram-bot-api';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import Datastore from 'nedb-promises';
import { FullSpecBaseDict, FullSpecListItem } from '../types';

dotenv.config();

const admins = [73628236];

const edboUrl = 'https://vstup.edbo.gov.ua/offer/';
const abitPoiskUrl = 'https://abit-poisk.org.ua/rate2019/direction/';
const vstupInfoUrl = 'http://vstup.info/2019/';
const vstupOsvitaUrl = 'https://vstup.osvita.ua/y2019/';

const examples = `*Примеры:*
\`${edboUrl}555585/\`
\`${abitPoiskUrl}555585\`
\`${vstupInfoUrl}174/i2019i174p555585.html\`
\`${vstupOsvitaUrl}r27/174/555585/\`
\`555585\``;

const tryAgain = 'Можешь попробовать еще раз с другой ссылкой';

const specInfo = (spec: FullSpecListItem) => `*Регион:* \`${spec.areaName.replace('`', '\'')}\`
*ВУЗ:* \`${spec.uniName.replace('`', '\'')}\`
${spec.faculty !== 'Бакалавр (на основі: ПЗСО)' ? `*Факультет:* \`${spec.faculty.replace('`', '\'')}\`
` : ''}*Специальность:* \`${spec.specNum}\`
*Макс. кол-во бюдж. мест:* \`${spec.budgetPlaces}\`

*Проходной балл:* \`${spec.applications[spec.applications.length - 1].points}\`

[Ссылка на список](${spec.specUrl})`;

interface User {
  tgId: number,
}

async function main() {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    console.error('No token provided!');
    process.exit(1);
  }
  const dumpPath = path.resolve(__dirname, '../../dumps/points.json');
  try {
    await fs.promises.access(dumpPath);
  } catch (e) {
    console.error('No dump file found!');
    process.exit(1);
  }
  const dumpBuffer = await fs.promises.readFile(dumpPath, 'utf-8');
  const dumpStats = await fs.promises.stat(dumpPath);
  const dump: FullSpecBaseDict = JSON.parse(dumpBuffer);
  const bot = new TelegramBot(token!, { polling: true });
  const db = Datastore.create({
    filename: 'users.db'
  });
  bot.on('message', async (msg) => {
    if (!msg.from) {
      return;
    }
    const user = await db.findOne<User>({ tgId: msg.from.id });
    if (!user) {
      await db.insert<User>({ tgId: msg.from.id });
    }
  });
  bot.onText(/^\/start(?:@\w+)?$/, async (msg) => {
    await bot.sendMessage(msg.chat.id, `*Привет!* Я — бот который поможет тебе узнать *приблизительные* проходные баллы на бюджет на любую специальность!

Для того чтобы узнать проходной балл на свою специальность тебе нужно отправить мне ссылку на списки этого конкурсного предложения на одном из этих сайтов: \`https://vstup.edbo.gov.ua\`, \`https://abit-poisk.org.ua\`, \`https://vstup.osvita.ua\` или \`http://vstup.info/\`. Также мне можно отправить код конкурсного предложения (цифры, находящиеся в конце ссылки).

${examples}

*Данные баллы не являются официальными и точными и предоставлены лишь для ознакомления, разработчик не несет ответственности за несовпадение реального и рассчитаного проходного балла

Расcчёт баллов на специализации специальностей 015 и 035 очень приблизителен!
*

_Разработчик бота и алгоритма:_ @mnb3000
_Разработчик улучшеного бота:_ @HomelessAtomist`,
      { parse_mode: 'Markdown', disable_web_page_preview: true })
  });
  bot.onText(/^([^\s\/].+)$/, async (msg, match) => {
    if (!match) {
      return;
    }
    const chatId = msg.chat.id;
    const urlMatch = match[1].trim().replace(/ /g, '');
    const specId = parseInt(
      urlMatch
        .replace(edboUrl, '')
        .replace(abitPoiskUrl, '')
        .replace(vstupInfoUrl, '')
        .replace(vstupOsvitaUrl, '')
        .replace(/\d+\/i2019i\d+p/, '')
        .replace('.html', '')
        .replace(/r\d+\/\d+\//, '')
        .replace(/\//g, ''),
      10
    );
    if (isNaN(specId)) {
      await bot.sendMessage(chatId, `*Неверный формат ввода!*

${examples}`, { parse_mode: 'Markdown' });
      return;
    }
    const spec = dump[specId];
    if (!spec) {
      await bot.sendMessage(chatId, `*Ошибка!*
Такого конкурсного предложения не существует, это не конкурсное предложение на бакалаврат или на этом предложении нет бюджетных мест.
${tryAgain}

${examples}`, { parse_mode: 'Markdown' });
      return;
    }
    if (!spec.applications.length) {
      await bot.sendMessage(chatId, `*Ни одна заявка не прошла на бюджет на это конкурсное предложение!*
_Ты можешь быть первым ;)_

${tryAgain}

${examples}`, { parse_mode: 'Markdown' });
      return;
    }
    console.log(spec);
    await bot.sendMessage(chatId, specInfo(spec), { parse_mode: 'Markdown' });
  });

  bot.onText(/^\/cast([^]*)/, async (msg, match) => {
    if (msg.chat.type !== 'private' || !admins.includes(msg.from!.id) || !match) {
      return;
    }
    const allUsers = await db.find<User>({});
    allUsers.forEach(async (user) => {
      try {
        await bot.sendMessage(user.tgId, match[1].trim(), { parse_mode: 'Markdown' });
      } catch (e) {
        console.log(user.tgId, ' blocked/not started bot');
      }
    });
  });
  bot.onText(/^\/lastupdate$/i, async (msg) => {
    const formattedDate = dumpStats.mtime.toLocaleString('ru');
    await bot.sendMessage(msg.chat.id, `Последнее обновление базы:
*${formattedDate}*`, { parse_mode: 'Markdown' })
  })
}

main()
  .catch((e) => console.log(e));
