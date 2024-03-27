import { Context, Markup } from 'telegraf';
import { WalletManager } from './wallet-manager';
import { NotificationType, NotificationTypeNames } from './types';
import { Twap } from './twap';
import { Database } from './db';
import { LiquidityHub } from './liquidity-hub';
import { DefiNotifications } from './defi-notifications';
import { EvmNodes } from './evm-nodes';
import { Perps } from './perps';

export async function getDailyReport(notificationType: NotificationType) {
  switch (notificationType) {
    case NotificationType.WalletManager:
      return await WalletManager.report();
    case NotificationType.Twap:
      return await Twap.report();
    case NotificationType.LiquidityHub:
      return await LiquidityHub.report();
    case NotificationType.DefiNotifications:
      return await DefiNotifications.report();
    case NotificationType.EvmNodesStatus:
      return await EvmNodes.report();
    case NotificationType.PerpsDailyReport:
      return await Perps.report();
    default:
      return null;
  }
}

export async function getAlerts(notificationType: NotificationType) {
  switch (notificationType) {
    case NotificationType.WalletManagerAlerts:
      return await WalletManager.alerts();
    case NotificationType.TwapAlerts:
      return await Twap.alerts();
    case NotificationType.LiquidityHubAlerts:
      return await LiquidityHub.alerts();
    case NotificationType.DefiNotificationsAlerts:
      return await DefiNotifications.alerts();
    case NotificationType.EvmNodesAlerts:
      return await EvmNodes.alerts();
    case NotificationType.PerpsExposureAlerts:
      return await Perps.alerts();
    default:
      return [];
  }
}

export async function subscribe(ctx: Context, db: Database, fromId: number) {
  if (!ctx.chat) {
    return;
  }

  try {
    if (ctx.chat.type === 'private') {
      return;
    }

    const admins = await ctx.getChatAdministrators();
    const isAdmin = admins.some((admin) => admin.user.id === fromId);

    if (isAdmin) {
      const subscriptions = await db.getByChatId(ctx.chat.id);

      const buttons = Object.values(NotificationType)
        .filter((n) => !subscriptions.some((s) => s.notificationType === n))
        .map((notificationType) => [
          Markup.button.callback(
            NotificationTypeNames[notificationType],
            `subscribe:${notificationType}`
          ),
        ]);

      buttons.push([Markup.button.callback('❌ Close', 'close')]);

      await ctx.reply('Thanks for adding me to this group. Subscribe to the following:', {
        parse_mode: 'Markdown',
        reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
      });
    } else {
      await ctx.reply('You are not an admin. Only admins can subscribe to notifications.');
    }
  } catch (err) {
    console.log(err);
  }
}
