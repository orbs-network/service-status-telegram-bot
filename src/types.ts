export enum NotificationType {
  WalletManager = 'WalletManager',
  Twap = 'TWAP',
  WalletManagerAlerts = 'WalletManagerAlerts',
  LiquidityHub = 'LiquidityHub',
  DefiNotifications = 'DefiNotifications',
  TwapAlerts = 'TwapAlerts',
  LiquidityHubAlerts = 'LiquidityHubAlerts',
  DefiNotificationsAlerts = 'DefiNotificationsAlerts',
  EvmNodesStatus = 'EvmNodesStatus',
  EvmNodesAlerts = 'EvmNodesAlerts',
}

export const NotificationTypeNames = {
  [NotificationType.WalletManager]: 'Wallet Manager',
  [NotificationType.WalletManagerAlerts]: 'Wallet Manager Alerts',
  [NotificationType.Twap]: 'TWAP',
  [NotificationType.TwapAlerts]: 'TWAP Alerts',
  [NotificationType.LiquidityHub]: 'Liquidity Hub',
  [NotificationType.LiquidityHubAlerts]: 'Liquidity Hub Alerts',
  [NotificationType.DefiNotifications]: 'DeFi Notifications',
  [NotificationType.DefiNotificationsAlerts]: 'DeFi Notifications Alerts',
  [NotificationType.EvmNodesStatus]: 'EVM Nodes Status',
  [NotificationType.EvmNodesAlerts]: 'EVM Nodes Alerts',
};

export const NotificationTypeUrls = {
  [NotificationType.WalletManager]: 'https://services-healthpage.orbs.network/#/wallets-manager',
  [NotificationType.WalletManagerAlerts]:
    'https://services-healthpage.orbs.network/#/wallets-manager',
  [NotificationType.Twap]: 'https://services-healthpage.orbs.network/#/twap',
  [NotificationType.TwapAlerts]: 'https://services-healthpage.orbs.network/#/twap',
  [NotificationType.LiquidityHub]: 'https://services-healthpage.orbs.network/#/clob',
  [NotificationType.LiquidityHubAlerts]: 'https://services-healthpage.orbs.network/#/clob',
  [NotificationType.DefiNotifications]:
    'https://services-healthpage.orbs.network/#/defi-notifications',
  [NotificationType.DefiNotificationsAlerts]:
    'https://services-healthpage.orbs.network/#/defi-notifications',
  [NotificationType.EvmNodesStatus]: 'https://services-healthpage.orbs.network/#/evm-nodes',
  [NotificationType.EvmNodesAlerts]: 'https://services-healthpage.orbs.network/#/evm-nodes',
};

export const AlertTypes = [
  NotificationType.WalletManagerAlerts,
  NotificationType.TwapAlerts,
  NotificationType.LiquidityHubAlerts,
  NotificationType.DefiNotificationsAlerts,
  NotificationType.EvmNodesAlerts,
];

export const StatusTypes = [
  NotificationType.WalletManager,
  NotificationType.Twap,
  NotificationType.LiquidityHub,
  NotificationType.DefiNotifications,
  NotificationType.EvmNodesStatus,
];

export type Notification = {
  id: string;
  chatId: number;
  notificationType: NotificationType;
};

export type Alert = {
  notificationType: NotificationType;
  alertType: string;
  message: string;
  timestamp: number;
  name: string;
};

export type AlertDb = {
  id: string;
  timestamp: number;
};
