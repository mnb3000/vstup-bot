import TelegramBot from 'node-telegram-bot-api';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import Datastore from 'nedb-promises';
import Excel, { PaperSize } from 'exceljs';
import { find } from 'lodash';
import { FullSpecBaseDict, FullSpecListItem, SearchPriorityStudent } from '../types';
import * as crypto from "crypto";

dotenv.config();

const admins = [73628236];

const httpPrefix = 'http://';
const httpsPrefix = 'https://';

const edboUrl = 'vstup.edbo.gov.ua/offer/';
const abitPoiskUrl = 'abit-poisk.org.ua/rate2020/direction/';
const vstupInfoUrl = 'vstup.info/2020/';
const vstupOsvitaUrl = 'vstup.osvita.ua/y2020/';

const examples = `*Примеры:*
\`${httpsPrefix}${edboUrl}719169/\`
\`${httpsPrefix}${abitPoiskUrl}719169\`
\`${httpPrefix}${vstupInfoUrl}174/i2020i174p719169.html\`
\`${httpsPrefix}${vstupOsvitaUrl}r27/174/719169/\`
\`719169\``;

const tryAgain = 'Можешь попробовать еще раз с другой ссылкой';

const specInfo = (spec: FullSpecListItem) => `*Регион:* \`${spec.areaName.replace('`', '\'')}\`
*ВУЗ:* \`${spec.uniName.replace('`', '\'')}\`
${spec.faculty !== 'Бакалавр (на основі: ПЗСО)' ? `*Факультет:* \`${spec.faculty.replace('`', '\'')}\`
` : ''}*Специальность:* \`${spec.specNum}\`
*Макс. кол-во бюдж. мест:* \`${spec.budgetPlaces}\`

*Проходной балл:* \`${spec.applications[spec.applications.length - 1].points}\`

[Ссылка на список](${spec.specUrl})`;

const inlineTableKeyboard = (specId: number) => ({
  inline_keyboard: [[{
    text: 'Получить полный список',
    callback_data: `getList_${specId}`
  }]]
});

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
  const dumpApplicationList = Object.keys(dump)
    .map((specId) => {
    const numSpecId = parseInt(specId, 10);
    const spec: FullSpecListItem = dump[numSpecId];
    return spec.applications.map((application, index) => ({
      ...application,
      searchName: application.name
        .replace(/\./g, '')
        .toLowerCase(),
      budgetPlaceRatingPos: index + 1,
    }));
  })
    .flat();
  const bot = new TelegramBot(token!, { polling: true });
  const tmpPath = path.resolve(__dirname, '../../tmp');
  try {
    await fs.promises.access(tmpPath);
  } catch (e) {
    await fs.promises.mkdir(tmpPath);
  }
  const db = Datastore.create({
    filename: 'users.db'
  });
  const users = await db.find<User>({});
  users.forEach(async (user) => {
    const userDuplicates = await db.find<User>({ tgId: user.tgId });
    if (userDuplicates.length > 1) {
      userDuplicates.slice(1, userDuplicates.length).forEach(async (user) => {
        await db.remove({ _id: user._id }, {});
      });
    }
  });

  bot.on('message', async (msg) => {
    if (!msg.from) {
      return;
    }
    const users = await db.find<User>({ tgId: msg.from.id });
    if (!users.length) {
      await db.insert<User>({ tgId: msg.from.id });
    }
    const promiseArr: Promise<number>[] = []
    if (users.length > 1) {
      users.slice(1, users.length).forEach((user) => {
        promiseArr.push(db.remove({ _id: user._id }, {}));
      });
      await Promise.all(promiseArr);
    }
  });
  bot.onText(/^\/(?:start)|(?:help)$/, async (msg) => {
    await bot.sendMessage(msg.chat.id, `*Привет!* Я — бот который поможет тебе узнать *приблизительные* проходные баллы на бюджет на любую специальность!
*NEW!* Теперь я могу показать полный список людей которые рекомендованы на бюджет и список людей *претендующих на академическую стипендию!*

Для того чтобы узнать проходной балл на свою специальность тебе нужно отправить мне ссылку на списки этого конкурсного предложения на одном из этих сайтов: \`https://vstup.edbo.gov.ua\`, \`https://abit-poisk.org.ua\`, \`https://vstup.osvita.ua\` или \`http://vstup.info/\`. Также мне можно отправить код конкурсного предложения (цифры, находящиеся в конце ссылки).

${examples}

*NEW!* Теперь я могу показать на какой приоритет проходишь на бюджет *ИМЕННО ТЫ!*

Так же поиск показывает проходите ли вы на *академическую стипендию*

*Примеры:*
\`/search Миколишин М. Ю.\`
\`/search наконечний о с\`

*Данные баллы не являются официальными и точными и предоставлены лишь для ознакомления, разработчик не несет ответственности за несовпадение реального и рассчитаного проходного балла*

Бот рассчитывает проходные баллы лишь на *ОТКРЫТЫЕ* конкурсные предложения.

*Расcчёт баллов на специализации специальностей 015 и 035 очень приблизителен!*

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
        .replace(httpPrefix, '')
        .replace(httpsPrefix, '')
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
    await bot.sendMessage(chatId, specInfo(spec), {
      parse_mode: 'Markdown',
      reply_markup: inlineTableKeyboard(specId),
    });
  });

  async function sendExcelFile(fileName: string, chatId: number, queryId: string) {
    const file = await fs.promises.readFile(`${tmpPath}/${fileName}`);
    await bot.sendDocument(chatId, file, {}, {
      filename: fileName,
      contentType: 'application/application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    await bot.sendMessage(chatId, `*Синим* выделены те люди, которые могут претендовать на *академическую стипендию*

*Разработчик бота не несет ответственности за несоответствие списков и претендентов на акад. стипендию с реальностью*`,
      { parse_mode: 'Markdown' });
    await bot.answerCallbackQuery(queryId)
  }

  bot.on('callback_query', async (query) => {
    if (!query.data || !query.message) {
      return;
    }
    const specMatch = query.data.match(/^getList_(\d+)$/);
    if (!specMatch) {
      return;
    }
    const specId = parseInt(specMatch[1], 10);
    const spec = dump[specId];
    if (!spec || !spec.applications.length) {
      return;
    }
    try {
      await sendExcelFile(`${specId}.xlsx`, query.message.chat.id, query.id);
    } catch (e) {
      const sheetApplications = spec.applications.map((application, index) => ({
        ...application,
        pos: index + 1,
      }));
      const workbook = new Excel.Workbook();
      const sheet = workbook.addWorksheet('List', {
        pageSetup: {
          paperSize: PaperSize.A4,
          orientation: 'portrait',
        }
      });
      sheet.columns = [
        {
          header: '№',
          key: 'pos',
          width: 8,
        },
        {
          header: 'ФИО',
          key: 'name',
          width: 20,
        },
        {
          header: 'КБ',
          key: 'points',
          width: 8,
        },
        {
          header: 'Приор',
          key: 'priority',
          width: 10,
        },
      ];
      sheet.addRows(sheetApplications);
      const stipBarrier = Math.floor(spec.budgetPlaces * 0.45);
      sheet.eachRow((row, index) => {
        const realIndex = index - 1;
        if (!realIndex) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {
              argb: 'FFFFFF00',
            },
          };
          return;
        }
        if (realIndex <= stipBarrier) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {
              argb: 'FF729FCF',
            },
          }
        }
      });
      await workbook.xlsx.writeFile(`${tmpPath}/${specId}.xlsx`);
      await sendExcelFile(`${specId}.xlsx`, query.message.chat.id, query.id);
    }
  });

  async function sendNotFound(chatId: number) {
    await bot.sendMessage(chatId, `*Не найдено!*
К сожалению эта заявка не была найдена в базе. Это означает либо то, что , к сожалению, вы не прошли на бюджет ни по одному из приоритетов, либо же ваша заявка прошла на *закрытое* конкурсное предложение с фиксированным количеством мест, либо вы *неверно указали данные*

*Примеры:*
\`/search Миколишин М. Ю.\`
\`/search наконечний о с\``,
      { parse_mode: 'Markdown' });
  }

  bot.onText(/^\/search([^\n\d]+)?(\d+)?$/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (!match || !match[1]) {
      await bot.sendMessage(chatId, `Я могу показать на какой приоритет проходишь на бюджет *ИМЕННО ТЫ!*

Так же поиск показывает проходите ли вы на *академическую стипендию*

*Примеры:*
\`/search Миколишин М. Ю.\`
\`/search наконечний о с\``, { parse_mode: 'Markdown' });
      return;
    }
    const name = match[1].replace(/\./g, '').toLowerCase().trim();
    let application: SearchPriorityStudent | undefined;
    application = find(dumpApplicationList, { searchName: name });
    if (!application) {
      await sendNotFound(chatId);
      return;
    }
    if (match[2]) {
      const uid = crypto.createHash('sha1').update(application.name + match[2]).digest('hex');
      application = find(dumpApplicationList, { uid });
    }
    if (!application) {
      await sendNotFound(chatId);
      return;
    }
    const spec = dump[application.specId];
    const stipBarrier = Math.floor(spec.budgetPlaces * 0.45);
    await bot.sendMessage(chatId, `*Имя:* \`${application.name}\`
*КБ:* \`${application.points}\`
*Приоритет:* \`${application.priority}\`
*Стипендия:* \`${application.budgetPlaceRatingPos <= stipBarrier ? 'Да' : 'Нет'}\`

${specInfo(spec)}

_Если это не ваша заявка - попробуйте добавить в команду ваш балл ЗНО по_ *украинскому языку и литературе
Пример:*
\`/search Миколишин М. Ю. 167\``,
      {
        parse_mode: 'Markdown',
        reply_markup: inlineTableKeyboard(application.specId),
      });
  });

  bot.onText(/^\/cast([^]*)/, async (msg, match) => {
    if (msg.chat.type !== 'private' || !admins.includes(msg.from!.id) || !match) {
      return;
    }
    const allUsers = await db.find<User>({});
    allUsers.forEach((user, index) => {
      setTimeout(() => {
        bot.sendMessage(user.tgId, match[1].trim(), { parse_mode: 'Markdown' })
          .catch((e) => console.log(`${user.tgId} error: ${e}`))
      }, index * 50)
    })
    await bot.sendMessage(msg.chat.id, `Разослано ${allUsers.length} людям`);
  });

  bot.onText(/^\/forwardCast$/, async (msg, match) => {
    if (msg.chat.type !== 'private' || !admins.includes(msg.from!.id) || !match || !msg.reply_to_message) {
      return;
    }
    const allUsers = await db.find<User>({});
    allUsers.forEach((user, index) => {
      setTimeout(() => {
        bot.forwardMessage(user.tgId, msg.reply_to_message!.chat.id, msg.reply_to_message!.message_id)
          .catch((e) => console.log(`${user.tgId} error: ${e}`))
      }, index * 300)
    })
    await bot.sendMessage(msg.chat.id, `Разослано ${allUsers.length} людям`);
  });

  bot.onText(/^\/previewCast([^]*)/, async (msg, match) => {
    if (msg.chat.type !== 'private' || !admins.includes(msg.from!.id) || !match) {
      return;
    }
    await bot.sendMessage(msg.chat.id, match[1].trim(), { parse_mode: 'Markdown' });
  })

  bot.onText(/^\/lastupdate$/i, async (msg) => {
    const formattedDate = dumpStats.mtime.toLocaleString('ru');
    await bot.sendMessage(msg.chat.id, `Последнее обновление базы:
*${formattedDate}*`, { parse_mode: 'Markdown' })
  });
}

main()
  .catch((e) => console.log(e));
