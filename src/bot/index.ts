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

const examples = `*Примеры:*
\`/points ${edboUrl}555585/\`
\`/points ${abitPoiskUrl}555585\``;

const tryAgain = 'Можешь попробовать еще раз с другой ссылкой';

const specInfo = (spec: FullSpecListItem) => `*Регион:* \`${spec.areaName}\`
*ВУЗ:* \`${spec.uniName}\`
${spec.faculty !== 'Бакалавр (на основі: ПЗСО)' ? `
*Факультет:* \`${spec.faculty}\`
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
    await bot.sendMessage(msg.chat.id, `*Привет!* Я бот который поможет тебе узнать *приблизительные* проходные баллы на бюджет на любую специальность!

Для того чтобы узнать проходной балл на свою специальность тебе нужно найти ссылку на списки этой специальности на одном из двух сайтов: https://vstup.edbo.gov.ua или https://abit-poisk.org.ua

${examples}

*Данные баллы не являются официальными и точными и предоставлены лишь для ознакомления, разработчик не несет ответственности за несовпадение реального и рассчитаного проходного балла*

_Разработчик бота и алгоритма:_ @mnb3000`,
      { parse_mode: 'Markdown', disable_web_page_preview: true })
  });
  bot.onText(/^\/points( .+)?$/, async (msg, match) => {
    if (!match) {
      return;
    }
    const chatId = msg.chat.id;
    if (!match[1]) {
      await bot.sendMessage(chatId, `*Тебе нужно предоставить ссылку на специальность после команды!*

${examples}`, { parse_mode: 'Markdown' });
      return;
    }
    const urlMatch = match[1].trim().replace(/ /g, '');
    if (!urlMatch.includes(edboUrl) && !urlMatch.includes(abitPoiskUrl)) {
      await bot.sendMessage(chatId, `*Неверный формат ссылки!*

${examples}`, { parse_mode: 'Markdown' });
      return;
    }
    const specId = parseInt(
      urlMatch
        .replace(edboUrl, '')
        .replace(abitPoiskUrl, '')
        .replace('\/', ''),
      10
    );
    if (isNaN(specId)) {
      await bot.sendMessage(chatId, `*Неверный формат ссылки!*

${examples}`, { parse_mode: 'Markdown' });
      return;
    }
    const spec = dump[specId];
    if (!spec) {
      await bot.sendMessage(chatId, `*Специальность не найдена у меня в базе :(*
${tryAgain}

${examples}`, { parse_mode: 'Markdown' });
      return;
    }
    if (!spec.applications.length) {
      await bot.sendMessage(chatId, `*Ни одна заявка не прошла на бюджет на эту специальность!*
_Ты можешь быть первым ;)_

${tryAgain}

${examples}`, { parse_mode: 'Markdown' });
      return;
    }
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
  })
}

main()
  .catch((e) => console.log(e));
