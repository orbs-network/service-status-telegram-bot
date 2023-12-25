export enum NotificationType {
  WalletManager = 'WalletManager',
  Twap = 'Twap',
  WalletManagerAlerts = 'WalletManagerAlerts',
  LiquidityHub = 'LiquidityHub',
  DefiNotifications = 'DefiNotifications',
  TwapAlerts = 'TwapAlerts',
  LiquidityHubAlerts = 'LiquidityHubAlerts',
  DefiNotificationsAlerts = 'DefiNotificationsAlerts',
}

export const NotificationTypeNames = {
  [NotificationType.WalletManager]: 'Wallet Manager',
  [NotificationType.Twap]: 'TWAP',
  [NotificationType.WalletManagerAlerts]: 'Wallet Manager Alerts',
  [NotificationType.LiquidityHub]: 'Liquidity Hub',
  [NotificationType.DefiNotifications]: 'DeFi Notifications',
  [NotificationType.TwapAlerts]: 'TWAP Alerts',
  [NotificationType.LiquidityHubAlerts]: 'Liquidity Hub Alerts',
  [NotificationType.DefiNotificationsAlerts]: 'DeFi Notifications Alerts',
};

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
