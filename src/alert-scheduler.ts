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
  const button = NotificationTypeButtons[notificationType].map((b) =>
    Markup.button.url(b.text, b.url)
  );

  for (const alert of alerts) {
    const existingAlert = await db.getAlert(alert);

    if (!existingAlert) {
      await db.insertAlert(alert);
      continue;
    }

    const diff = differenceInMinutes(existingAlert.timestamp, alert.timestamp);
    if (existingAlert.sent && diff > 60) {
      await db.deleteAlert(existingAlert.id);
      continue;
    }

    if (existingAlert.count < alertThreshold) {
      try {
        await db.appendAlertCount(existingAlert.id);
      } catch (err) {
        console.error('An error occurred when appending alert count', err);
      }
      continue;
    }

    if (existingAlert.sent) {
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
