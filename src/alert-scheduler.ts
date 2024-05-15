import { differenceInMinutes, differenceInSeconds } from 'date-fns';
import { Alert, NotificationType, NotificationTypeButtons } from './types';
import { Context, Markup, Telegraf } from 'telegraf';
import { Database } from './db';
import { Update } from 'telegraf/types';
import { ALERT_POLL_TIME_SEC } from '.';

type SendAlertsParams = {
  db: Database;
  bot: Telegraf<Context<Update>>;
  alerts: Alert[];
  alertThreshold: number;
};

export async function sendAlerts({ db, bot, alerts, alertThreshold }: SendAlertsParams) {
  for (const alert of alerts) {
    // Custom threshold for fantom EVM Nodes
    // TODO: need a better solution
    const threshold =
      alert.notificationType === NotificationType.EvmNodesAlerts && alert.name === 'fantom'
        ? 12
        : alertThreshold;

    const existingAlertDb = await db.getAlert(alert);

    if (!existingAlertDb) {
      await db.insertAlert(alert);
      console.log('Added new alert to db', JSON.stringify(alert));
      continue;
    }

    const diffInMins = differenceInMinutes(alert.timestamp, existingAlertDb.timestamp);
    if (existingAlertDb.sent && diffInMins >= 60) {
      await db.deleteAlert(existingAlertDb.id);
      console.log(
        'Deleted existing alert from db as it has passed 60mins',
        JSON.stringify(existingAlertDb)
      );
      continue;
    }

    const diffInSeconds = differenceInSeconds(new Date().getTime(), existingAlertDb.timestamp);
    const thresholdInSeconds = threshold * ALERT_POLL_TIME_SEC;
    if (
      !existingAlertDb.sent &&
      existingAlertDb.count < threshold &&
      diffInSeconds > thresholdInSeconds
    ) {
      await db.deleteAlert(existingAlertDb.id);
      console.log(
        `Deleted existing alert from db as it didn't persist for the duration of the threshold`,
        JSON.stringify(existingAlertDb)
      );
      continue;
    }

    if (existingAlertDb.count < threshold) {
      try {
        await db.appendAlertCount(existingAlertDb.id);
        console.log('Append count to alert', JSON.stringify(existingAlertDb));
      } catch (err) {
        console.error('An error occurred when appending alert count', JSON.stringify(err));
      }
      continue;
    }

    if (existingAlertDb.sent) {
      continue;
    }

    const notifications = await db.getByNotificationType(alert.notificationType);
    const buttons = NotificationTypeButtons[alert.notificationType].map((b) =>
      Markup.button.url(b.text, b.url)
    );
    let errors = 0;
    for (const { chatId } of notifications) {
      try {
        await bot.telegram.sendMessage(chatId, alert.message, {
          parse_mode: 'Markdown',
          reply_markup: Markup.inlineKeyboard([buttons]).reply_markup,
        });
      } catch (err) {
        console.error(
          `An error occurred when sending alert id: ${existingAlertDb.id} ${new Date(
            existingAlertDb.timestamp
          ).toLocaleString()} to chat id: ${chatId}`,
          JSON.stringify(err)
        );
        errors++;
        // Handle the error (retry, notify user, etc.)
      }
    }
    db.sentAlert(existingAlertDb.id, alert.timestamp);
    console.log(
      `Sent alert ${existingAlertDb.id} to ${notifications.length - errors}/${
        notifications.length
      } chats. Had ${errors} errors.`
    );
  }
}
