import { Context, Markup } from 'telegraf';
import { WalletManager } from './wallet-manager';
import { config } from './config';
import { NotificationType, NotificationTypeNames } from './types';
import { Twap } from './twap';
import { Database } from './db';
import { LiquidityHub } from './liquidity-hub';
import { DefiNotifications } from './defi-notifications';

export async function getDailyReport(notificationType: NotificationType) {
  switch (notificationType) {
    case NotificationType.WalletManager: {
      if (!config.WalletManagerEndpoint) {
        return 'Wallet manager endpoint is not configured';
      }

      return await WalletManager.report(config.WalletManagerEndpoint);
    }
    case NotificationType.Twap:
      return await Twap.report();
    case NotificationType.LiquidityHub:
      return await LiquidityHub.report();
    case NotificationType.DefiNotifications:
      return await DefiNotifications.report();
    default:
      return null;
  }
}

export async function getAlerts(notificationType: NotificationType) {
  switch (notificationType) {
    case NotificationType.WalletManagerAlerts: {
      if (!config.WalletManagerEndpoint) {
        console.error('Wallet manager endpoint is not configured');
        return [];
      }

      return await WalletManager.alerts({
        walletManagerEndpoint: config.WalletManagerEndpoint,
      });
    }
    case NotificationType.TwapAlerts:
      return await Twap.alerts();
    case NotificationType.LiquidityHubAlerts:
      return await LiquidityHub.alerts();
    case NotificationType.DefiNotificationsAlerts:
      return await DefiNotifications.alerts();
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
        .map((notificationType) =>
          Markup.button.callback(
            NotificationTypeNames[notificationType],
            `subscribe:${notificationType}`
          )
        );

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
