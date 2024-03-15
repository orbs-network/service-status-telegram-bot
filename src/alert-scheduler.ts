import { differenceInHours } from 'date-fns';
import { Alert, NotificationType, NotificationTypeUrls } from './types';
import { Context, Markup, Telegraf } from 'telegraf';
import { Database } from './db';
import { Update } from 'telegraf/types';

type SendAlertsParams = {
  db: Database;
  notificationType: NotificationType;
  bot: Telegraf<Context<Update>>;
  alerts: Alert[];
  buttonText: string;
  alertThreshold: number;
};

export async function sendAlerts({
  db,
  notificationType,
  bot,
  alerts,
  buttonText,
  alertThreshold,
}: SendAlertsParams) {
  const button = Markup.button.url(buttonText, NotificationTypeUrls[notificationType]);

  for (const alert of alerts) {
    const existingAlert = await db.getAlert(alert);

    if (!existingAlert) {
      await db.insertAlert(alert);
      continue;
    }

    if (existingAlert.count < alertThreshold - 1) {
      try {
        await db.appendAlertCount(existingAlert.id);
      } catch (err) {
        console.error('An error occurred when appending alert count', err);
      }
      continue;
    }

    const diff = differenceInHours(existingAlert.timestamp, alert.timestamp);
    if (existingAlert.sent && diff >= 1) {
      await db.deleteAlert(existingAlert.id);
      continue;
    }

    const notifications = await db.getByNotificationType(notificationType);
    for (const { chatId } of notifications) {
      try {
        await bot.telegram.sendMessage(chatId, alert.message, {
          parse_mode: 'Markdown',
          reply_markup: Markup.inlineKeyboard([button]).reply_markup,
        });
      } catch (err) {
        console.log('An error occurred when sending alerts', err);
        // Handle the error (retry, notify user, etc.)
      }
    }

    db.sentAlert(existingAlert.id, alert.timestamp);
  }
}
