import { differenceInMinutes } from 'date-fns';
import { Alert, NotificationType, NotificationTypeButtons } from './types';
import { Context, Markup, Telegraf } from 'telegraf';
import { Database } from './db';
import { Update } from 'telegraf/types';

type SendAlertsParams = {
  db: Database;
  notificationType: NotificationType;
  bot: Telegraf<Context<Update>>;
  alerts: Alert[];
  alertThreshold: number;
};

export async function sendAlerts({
  db,
  notificationType,
  bot,
  alerts,
  alertThreshold,
}: SendAlertsParams) {
  const button = NotificationTypeButtons[notificationType].map((b) =>
    Markup.button.url(b.text, b.url)
  );

  for (const alert of alerts) {
    const existingAlert = await db.getAlert(alert);

    if (!existingAlert) {
      await db.insertAlert(alert);
      console.log('Added new alert to db', JSON.stringify(alert));
      continue;
    }

    const diff = differenceInMinutes(existingAlert.timestamp, alert.timestamp);
    if (diff >= 60) {
      await db.deleteAlert(existingAlert.id);
      console.log(
        'Deleted existing alert from db as it has passed 60mins',
        JSON.stringify(existingAlert)
      );
      continue;
    }

    if (existingAlert.count < alertThreshold) {
      try {
        await db.appendAlertCount(existingAlert.id);
        console.log('Append count to alert', existingAlert);
      } catch (err) {
        console.error('An error occurred when appending alert count', JSON.stringify(err));
      }
      continue;
    }

    if (existingAlert.sent) {
      continue;
    }

    const notifications = await db.getByNotificationType(notificationType);
    let errors = 0;
    for (const { chatId } of notifications) {
      try {
        await bot.telegram.sendMessage(chatId, alert.message, {
          parse_mode: 'Markdown',
          reply_markup: Markup.inlineKeyboard([button]).reply_markup,
        });
      } catch (err) {
        console.error(
          `An error occurred when sending alert id: ${existingAlert.id} ${new Date(
            existingAlert.timestamp
          ).toLocaleString()} to chat id: ${chatId}`,
          JSON.stringify(err)
        );
        errors++;
        // Handle the error (retry, notify user, etc.)
      }
    }
    db.sentAlert(existingAlert.id, alert.timestamp);
    console.log(`Sent alert ${existingAlert.id} to ${notifications.length - errors} chats`);
  }
}
