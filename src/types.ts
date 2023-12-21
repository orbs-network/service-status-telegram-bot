export enum NotificationType {
  WalletManager = 'WalletManager',
  TWAP = 'TWAP',
  WalletManagerAlerts = 'WalletManagerAlerts',
}

export const NotificationTypeNames = {
  [NotificationType.WalletManager]: 'Wallet Manager',
  [NotificationType.TWAP]: 'TWAP',
  [NotificationType.WalletManagerAlerts]: 'Wallet Manager Alerts',
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
