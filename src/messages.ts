import { Context, Markup } from 'telegraf';
import { WalletManager } from './wallet-manager';
import { config } from './config';
import { NotificationType } from './types';
import { Twap } from './twap';

export async function getDailyReport(notificationType: NotificationType) {
  switch (notificationType) {
    case NotificationType.WalletManager: {
      if (!config.WalletManagerEndpoint) {
        return 'Wallet manager endpoint is not configured';
      }

      const output = await WalletManager.report(config.WalletManagerEndpoint);
      return output;
    }
    case NotificationType.TWAP:
      return null;
    default:
      return null;
  }
}

export async function getAlerts(notificationType: NotificationType) {
  switch (notificationType) {
    case NotificationType.WalletManager: {
      if (!config.WalletManagerEndpoint) {
        console.error('Wallet manager endpoint is not configured');
        return [];
      }

      return await WalletManager.alerts({
        walletManagerEndpoint: config.WalletManagerEndpoint,
      });
    }
    case NotificationType.TWAP:
      return [];
  }
}

export async function subscribe(ctx: Context, fromId: number) {
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
      await ctx.reply('Thanks for adding me to this group. Subscribe to the following:', {
        parse_mode: 'Markdown',
        reply_markup: Markup.inlineKeyboard([
          Markup.button.callback('Wallet Manager', `subscribe:${NotificationType.WalletManager}`),
          Markup.button.callback('TWAP', `subscribe:${NotificationType.TWAP}`),
        ]).reply_markup,
      });
    } else {
      await ctx.reply('You are not an admin. Only admins can subscribe to notifications.');
    }
  } catch (err) {
    console.log(err);
  }
}
