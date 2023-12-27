import axios from 'axios';
import { WalletManagerAlert, WalletManagerResponse } from './types';
import { table } from 'table';
import { Alert, NotificationType } from '../types';
import { config } from '../config';

type AlertsParams = {
  walletManagerEndpoint: string;
};

export class WalletManager {
  static async report(walletManagerEndpoint: string) {
    let output = '📊 *WALLET MANAGER*\n\n';

    try {
      const result = await axios.get<WalletManagerResponse>(walletManagerEndpoint);

      if (!result.data.networks) {
        throw new Error('No data. Something wrong with /health endpoint');
      }

      const tableOutput = [
        ['', 'A.', 'U.', 'E.', ''],
        ...Object.entries(result.data.networks).map(([name, network]) => {
          const availableWallets = Object.entries(network.wallets.availableWallets).length;
          const unusableWallets = Object.entries(network.wallets.unusableWallets).length;

          return [
            name,
            availableWallets,
            unusableWallets,
            network.errorCount,
            network.status === 'OK' ? '✅' : network.status,
          ];
        }),
      ];

      output += `\`\`\`\n${table(tableOutput, { ...config.AsciiTableOpts })}\n\`\`\``;
    } catch (error) {
      console.error(error);

      const err = error as Error;

      if (err.message) {
        output += `\n\n*Error*: ${err.message}\n`;
      } else {
        output += `\n\n*Error*: Unknown error\n`;
      }
    }

    // post output to tg bot
    return output;
  }

  static async alerts({ walletManagerEndpoint }: AlertsParams) {
    const alerts: Alert[] = [];
    try {
      const result = await axios.get<WalletManagerResponse>(walletManagerEndpoint);

      if (!result.data.networks) {
        throw new Error('No data. Something wrong with /health endpoint');
      }

      Object.entries(result.data.networks).forEach(([name, network]) => {
        const unusableWallets = Object.entries(network.wallets.unusableWallets).length;
        if (unusableWallets > 0) {
          alerts.push({
            notificationType: NotificationType.WalletManagerAlerts,
            alertType: WalletManagerAlert.UnusableWallets,
            name,
            timestamp: result.data.timestamp,
            message: `🚨 *WALLET MANAGER UNUSABLE WALLETS* 🚨\n\n*${name.toUpperCase()}* has *${unusableWallets}* unusable wallet${
              unusableWallets > 1 ? 's' : ''
            }!`,
          });
        }

        const availableWallets = Object.entries(network.wallets.availableWallets).length;
        const totalWallets = Object.entries(network.wallets.all).length;
        const percentageAvailable = Math.round((availableWallets / totalWallets) * 100);
        if (percentageAvailable <= 30) {
          alerts.push({
            notificationType: NotificationType.WalletManagerAlerts,
            alertType: WalletManagerAlert.LowAvailableWallets,
            name,
            timestamp: result.data.timestamp,
            message: `🚨 *WALLET MANAGER AVAILABLE WALLETS ARE LOW* 🚨\n\n*${name.toUpperCase()}* has *${availableWallets}* of *${totalWallets}* wallets available!`,
          });
        }

        const treasuryBalance = network.wallets.treasury.balanceInWU;
        const minTreasuryBalance = result.data.metadata.networks[name].walletThresholds.minTreasury;

        if (treasuryBalance <= minTreasuryBalance) {
          alerts.push({
            notificationType: NotificationType.WalletManagerAlerts,
            alertType: WalletManagerAlert.LowTresuryBalance,
            name,
            timestamp: result.data.timestamp,
            message: `🚨 *WALLET MANAGER LOW TREASURY BALANCE* 🚨\n\n*${name.toUpperCase()}* has *${treasuryBalance}* in treasury when minimum is *${minTreasuryBalance}*!`,
          });
        }

        if (network.status !== 'OK') {
          alerts.push({
            notificationType: NotificationType.WalletManagerAlerts,
            alertType: WalletManagerAlert.NetworkDown,
            name,
            timestamp: result.data.timestamp,
            message: `🚨 *WALLET MANAGER NETWORK STATUS* 🚨\n\n*${name.toUpperCase()}*: ${
              network.status
            }`,
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
    return alerts;
  }
}
