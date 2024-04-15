import { Telegraf, Context, Markup } from 'telegraf';
import { CallbackQuery, Update } from 'telegraf/types';
import { config } from './config';
import { Database } from './db';
import { CronJob } from 'cron';
import { wait } from './utils';
import { getAlerts, getDailyReport, subscribe } from './messages';
import { NotificationType, NotificationTypeNames, NotificationTypeButtons } from './types';
import { sendAlerts } from './alert-scheduler';

if (!config.BotToken) {
  throw new Error('Bot token missing!');
}

export const bot = new Telegraf<Context<Update>>(config.BotToken);
export const db = new Database();

bot.start(async (ctx) => {
  try {
    const { chat } = ctx.message;

    if (chat.type === 'private') {
      ctx.sendMessage(
        `*Let's get started*\n\nAdd me to a group and follow the instructions to get started.`,
        {
          parse_mode: 'Markdown',
        }
      );
      return;
    }
  } catch (err) {
    console.log('An error occured when executing the start command', err);
  }
});

bot.command('info', async (ctx) => {
  ctx.reply(
    `*Bot Info*\n\n- Bot name: ${bot.botInfo?.first_name}\n- Bot username: ${bot.botInfo?.username}\n- Bot id: ${bot.botInfo?.id}\n- Chat Id: ${ctx.chat.id}`,
    {
      parse_mode: 'Markdown',
    }
  );
  return;
});

bot.on('my_chat_member', async (ctx) => {
  if (ctx.update.my_chat_member.new_chat_member.user.id !== bot.botInfo?.id) {
    return;
  }

  if (
    ctx.update.my_chat_member.new_chat_member.status === 'kicked' ||
    ctx.update.my_chat_member.new_chat_member.status === 'left'
  ) {
    try {
      // clear by chat id
      await db.deleteByChatId(ctx.chat.id);
    } catch (err) {
      console.log('An error occured when clearing db', err);
    }
    return;
  }

  if (ctx.update.my_chat_member.new_chat_member.status !== 'member') {
    return;
  }

  // send admin message to subscribe to notifications
  await subscribe(ctx, db, ctx.update.my_chat_member.from.id);
});

bot.command('subscribe', async (ctx) => {
  if (!ctx.from) {
    return;
  }

  await subscribe(ctx, db, ctx.from.id);
});

bot.action('showAlerts', async (ctx) => {
  if (!ctx.callbackQuery) {
    return;
  }

  const fromId = ctx.from?.id;

  if (!fromId) {
    return;
  }

  await subscribe(ctx, db, fromId);
  ctx.deleteMessage(ctx.callbackQuery.message?.message_id);
});

bot.action(/^subscribe:/g, async (ctx) => {
  try {
    if (!ctx.callbackQuery) {
      throw new Error();
    }

    const chatId = ctx.callbackQuery.message?.chat.id;
    const notificationType = (ctx.callbackQuery as CallbackQuery.DataQuery).data.split(
      ':'
    )[1] as NotificationType;

    if (!chatId) {
      throw new Error();
    }

    await db.insert({ chatId, notificationType });

    ctx.answerCbQuery(`You have subscribed to ${NotificationTypeNames[notificationType]}.`, {
      show_alert: true,
    });
  } catch (err) {
    let message = 'An error occured when subscribing';

    const error = err as Error;

    if (error.message) {
      message += `: ${error.message}`;
    }

    ctx.answerCbQuery(message, { show_alert: true });
  }
  ctx.deleteMessage();
});

bot.command('admin', async (ctx) => {
  try {
    const admins = await ctx.getChatAdministrators();
    const isAdmin = admins.some((admin) => admin.user.id === ctx.from.id);

    if (!isAdmin) {
      return;
    }

    const subscriptions = await db.getByChatId(ctx.chat.id);

    const buttons = [];

    if (subscriptions.length > 0) {
      buttons.push([Markup.button.callback('Subscriptions', 'title')]);
    }

    subscriptions.forEach((item) => {
      buttons.push([
        Markup.button.callback(
          NotificationTypeNames[item.notificationType],
          `report:${item.notificationType}`
        ),
        Markup.button.callback('🗑️', `rm:${item.notificationType}`),
      ]);
    });

    buttons.push([Markup.button.callback('🪄 Add alerts', 'showAlerts')]);
    buttons.push([Markup.button.callback('❌ Close', 'close')]);

    await ctx.reply(
      `Manage the *Orbs Service Status* subscriptions for this group.\n\n- Add/remove subscriptions\n- View a report of your subscriptions`,
      {
        reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
        parse_mode: 'Markdown',
      }
    );
  } catch (err) {
    console.log('An unknown error occured.', err);
  }
});

bot.action('close', async (ctx) => {
  ctx.deleteMessage();
});

bot.action(/^report:/g, async (ctx) => {
  try {
    if (!ctx.callbackQuery) {
      throw new Error();
    }

    const chatId = ctx.callbackQuery.message?.chat.id;

    if (!chatId) {
      throw new Error('No chat Id');
    }

    const notificationType = (ctx.callbackQuery as CallbackQuery.DataQuery).data.split(
      ':'
    )[1] as NotificationType;

    const report = await getDailyReport(notificationType);

    if (!report) {
      return;
    }

    const button = NotificationTypeButtons[notificationType].map((b) =>
      Markup.button.url(b.text, b.url)
    );

    ctx.reply(report, {
      parse_mode: 'Markdown',
      reply_markup: Markup.inlineKeyboard([button]).reply_markup,
    });
    ctx.deleteMessage();
  } catch (err) {
    ctx.answerCbQuery(`An unknown error occured.`, { show_alert: true });
  }
});

bot.action(/^rm:/g, async (ctx) => {
  try {
    if (!ctx.callbackQuery) {
      throw new Error();
    }

    const chatId = ctx.callbackQuery.message?.chat.id;

    if (!chatId) {
      throw new Error('No chat Id');
    }

    const notificationType = (ctx.callbackQuery as CallbackQuery.DataQuery).data.split(
      ':'
    )[1] as NotificationType;
    const id = db.getId({ chatId, notificationType });

    await db.delete(id);

    ctx.answerCbQuery(`You have unsubscribed from ${NotificationTypeNames[notificationType]}`, {
      show_alert: true,
    });
    ctx.deleteMessage();
  } catch (err) {
    ctx.answerCbQuery(`An unknown error occured.`, { show_alert: true });
  }
});

const dailyReportScheduler = new CronJob('0 0 7 * * *', async () => {
  // Your post_info_proposals_daily logic here
  console.log('Running dailyReportScheduler...');

  const dailySnapshot: Record<NotificationType, string> = {} as Record<NotificationType, string>;

  const notificationTypes = Object.values(NotificationType);
  for (const notificationType of notificationTypes) {
    try {
      const report = await getDailyReport(notificationType);
      if (!report) {
        continue;
      }
      dailySnapshot[notificationType] = report;
    } catch (err) {
      console.log('An error occurred when sending daily report', err);
      // Handle the error (retry, notify user, etc.)
    }
  }

  const notifications = await db.getAll();
  for (const { chatId, notificationType } of notifications) {
    try {
      const message = dailySnapshot[notificationType];
      if (!message) {
        continue;
      }

      const button = NotificationTypeButtons[notificationType].map((b) =>
        Markup.button.url(b.text, b.url)
      );

      await bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: Markup.inlineKeyboard([button]).reply_markup,
      });
      await wait(1000);
    } catch (err) {
      console.log('An error occurred when sending daily report', err);
      // Handle the error (retry, notify user, etc.)
    }
  }
});

function getAlertThreshold(notificationType: NotificationType) {
  switch (notificationType) {
    case NotificationType.EvmNodesAlerts:
    case NotificationType.PerpsExposureAlerts:
      return 6;
    default:
      return 3;
  }
}

// every 30 seconds
const alertScheduler = new CronJob('*/30 * * * * *', async () => {
  // Your post_info_proposals_daily logic here
  console.log('Running alertScheduler...');

  const notificationTypes = Object.values(NotificationType);

  for (const notificationType of notificationTypes) {
    try {
      const alerts = await getAlerts(notificationType);

      await sendAlerts({
        db,
        notificationType,
        bot,
        alerts,
        alertThreshold: getAlertThreshold(notificationType),
      });
    } catch (err) {
      console.log('An error occurred when sending alerts', err);
      // Handle the error (retry, notify user, etc.)
    }
  }
});

bot.launch();
dailyReportScheduler.start();
alertScheduler.start();

console.log('Orbs Status Bot is up and running!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
