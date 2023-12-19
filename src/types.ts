export enum NotificationType {
  WalletManager = 'WalletManager',
  TWAP = 'TWAP',
}

export const NotificationTypeNames = {
  [NotificationType.WalletManager]: 'Wallet Manager',
  [NotificationType.TWAP]: 'TWAP',
};

export type Notification = {
  id: string;
  chatId: number;
  notificationType: NotificationType;
};
