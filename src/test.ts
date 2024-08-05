import { Markup } from 'telegraf';
import { config } from './config';
import { PerpsAlert } from './perps/types';
import { Alert, NotificationType, NotificationTypeButtons, NotificationTypeNames } from './types';
import { dollar } from './utils';
import { Perps } from './perps';

async function testExposureAlert() {
  const alert: Alert = {
    notificationType: NotificationType.PerpsExposureAlertsStaging,
    alertType: PerpsAlert.PerpsExposure,
    name: 'XRPUSDT',
    timestamp: new Date().getTime(),
    message: `🚨 *${
      NotificationTypeNames[NotificationType.PerpsExposureAlertsStaging]
    }* 🚨\n\n*${'XRPUSDT'}*: ${dollar.format(1000)}`,
  };

  const buttons = NotificationTypeButtons[NotificationType.PerpsExposureAlertsStaging].map((b) =>
    Markup.button.url(b.text, b.url)
  );

  // TODO: send alert via POST request
  const body = {
    chat_id: -1002133089243,
    text: alert.message,
    parse_mode: 'Markdown',
    reply_markup: Markup.inlineKeyboard([buttons]).reply_markup,
  };

  const result = await fetch(`https://api.telegram.org/bot${config.BotToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  console.log(await result.json());
}

// testExposureAlert();

async function testPerpsReport() {
  const report = await Perps.report();
  console.log(report);
}

testPerpsReport();
