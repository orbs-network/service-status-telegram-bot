import { Telegraf, Context, Markup } from 'telegraf';
import { CallbackQuery, Update } from 'telegraf/types';
import { config } from './config';
import { WalletManager } from './wallet-manager';
import { Database } from './db';
import { CronJob } from 'cron';
import { wait } from './utils';
import { getAlerts, getDailyReport, subscribe } from './messages';
import { NotificationType, NotificationTypeNames } from './types';
import { differenceInHours } from 'date-fns';
import { Twap } from './twap';
import { LiquidityHub } from './liquidity-hub';
import { DefiNotifications } from './defi-notifications';

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
  const { chat } = ctx.message;

  ctx.reply(
    `*Bot Info*\n\n- Bot name: ${bot.botInfo?.first_name}\n- Bot username: ${bot.botInfo?.username}\n- Bot id: ${bot.botInfo?.id}\n- Chat Id: ${chat.id}`,
    {
      parse_mode: 'Markdown',
    }
  );
  return;
});

bot.command('walletmanager', async (ctx) => {
  if (!config.WalletManagerEndpoint) {
    ctx.reply('Wallet manager endpoint is not configured');
    return;
  }

  const output = await WalletManager.report(config.WalletManagerEndpoint);

  ctx.reply(output, {
    parse_mode: 'Markdown',
  });
});

bot.command('twap', async (ctx) => {
  const output = await Twap.report();
  ctx.reply(output, {
    parse_mode: 'Markdown',
  });
});

bot.command('lh', async (ctx) => {
  const output = await LiquidityHub.report();
  ctx.reply(output, {
    parse_mode: 'Markdown',
  });
});

bot.command('defi', async (ctx) => {
  const output = await DefiNotifications.report();
  ctx.reply(output, {
    parse_mode: 'Markdown',
  });
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

bot.action('subscribe', async (ctx) => {
  if (!ctx.callbackQuery) {
    return;
  }

  const fromId = ctx.from?.id;

  if (!fromId) {
    return;
  }

  await subscribe(ctx, db, fromId);
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
  const { chat } = ctx.message;
  if (chat.type === 'private') {
    return;
  }

  try {
    const admins = await ctx.getChatAdministrators();
    const isAdmin = admins.some((admin) => admin.user.id === ctx.from.id);

    if (!isAdmin) {
      return;
    }

    const subscriptions = await db.getByChatId(ctx.chat.id);

    const buttons = subscriptions.map((item) => [
      Markup.button.callback(
        NotificationTypeNames[item.notificationType],
        `report:${item.notificationType}`
      ),
      Markup.button.callback('🗑️', `rm:${item.notificationType}`),
    ]);

    buttons.push([Markup.button.callback('🪄 Subscribe', 'subscribe')]);
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

    ctx.reply(report, {
      parse_mode: 'Markdown',
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

const dailyReportScheduler = new CronJob('0 0 12 * * *', async () => {
  // Your post_info_proposals_daily logic here
  console.log('Running dailyReportScheduler...');

  // TODO: get snapshot of data then send to all subscribers
  const dataSnapshot: Record<NotificationType, string> = {} as Record<NotificationType, string>;
  const notificationTypes = Object.values(NotificationType);
  for (const notificationType of notificationTypes) {
    try {
      const report = await getDailyReport(notificationType);
      if (!report) {
        continue;
      }
      dataSnapshot[notificationType] = report;
    } catch (err) {
      console.log('An error occurred when sending daily report', err);
      // Handle the error (retry, notify user, etc.)
    }
  }

  const notifications = await db.getAll();
  for (const { chatId, notificationType } of notifications) {
    try {
      const message = dataSnapshot[notificationType];
      if (!message) {
        continue;
      }
      await bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
      });
      await wait(1000);
    } catch (err) {
      console.log('An error occurred when sending daily report', err);
      // Handle the error (retry, notify user, etc.)
    }
  }
});

const alertScheduler = new CronJob('0 */1 * * * *', async () => {
  // Your post_info_proposals_daily logic here
  console.log('Running alertScheduler...');

  const notificationTypes = Object.values(NotificationType);
  for (const notificationType of notificationTypes) {
    try {
      const alerts = await getAlerts(notificationType);

      for (const alert of alerts) {
        const existingAlert = await db.getAlert(alert);
        if (existingAlert) {
          const diff = differenceInHours(existingAlert.timestamp, alert.timestamp);
          if (diff < 1) {
            continue;
          }

          await db.deleteAlert(existingAlert.id);
        }
        const notifications = await db.getByNotificationType(notificationType);
        for (const { chatId } of notifications) {
          try {
            await bot.telegram.sendMessage(chatId, alert.message, {
              parse_mode: 'Markdown',
            });
            await wait(1000);
          } catch (err) {
            console.log('An error occurred when sending alerts', err);
            // Handle the error (retry, notify user, etc.)
          }
        }
        await db.insertAlert(alert);
      }
    } catch (err) {
      console.log('An error occurred when sending alerts', err);
      // Handle the error (retry, notify user, etc.)
    }
  }
});

bot.telegram.setMyCommands([
  {
    command: 'admin',
    description: 'Manage alerts and status updates',
  },
]);

bot.launch();
dailyReportScheduler.start();
alertScheduler.start();

console.log('Orbs Status Bot is up and running!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
