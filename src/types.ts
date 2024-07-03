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
  PerpsDailyReport = 'PerpsDailyReport',
  PerpsExposureAlertsProd = 'PerpsExposureAlertsProd',
  PerpsExposureAlertsStaging = 'PerpsExposureAlertsStaging',
  Solver = 'Solver',
  SolverAlerts = 'SolverAlerts',
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
  [NotificationType.PerpsDailyReport]: 'Perps Daily Report',
  [NotificationType.PerpsExposureAlertsProd]: 'Perps Exposure Alerts [PROD]',
  [NotificationType.PerpsExposureAlertsStaging]: 'Perps Exposure Alerts [STAGING]',
  [NotificationType.Solver]: 'Orbs Solver',
  [NotificationType.SolverAlerts]: 'Orbs Solver Alerts',
};

export const NotificationTypeButtons = {
  [NotificationType.WalletManager]: [
    {
      text: '🔗 Open status page',
      url: 'https://services-healthpage.orbs.network/#/wallets-manager',
    },
  ],
  [NotificationType.WalletManagerAlerts]: [
    {
      text: '🔗 Open status page',
      url: 'https://services-healthpage.orbs.network/#/wallets-manager',
    },
  ],
  [NotificationType.Twap]: [
    { text: '🔗 Open status page', url: 'https://services-healthpage.orbs.network/#/twap' },
  ],
  [NotificationType.TwapAlerts]: [
    { text: '🔗 Open status page', url: 'https://services-healthpage.orbs.network/#/twap' },
  ],
  [NotificationType.LiquidityHub]: [
    { text: '🔗 Open status page', url: 'https://services-healthpage.orbs.network/#/clob' },
  ],
  [NotificationType.LiquidityHubAlerts]: [
    { text: '🔗 Open status page', url: 'https://services-healthpage.orbs.network/#/clob' },
  ],
  [NotificationType.DefiNotifications]: [
    {
      text: '🔗 Open status page',
      url: 'https://services-healthpage.orbs.network/#/defi-notifications',
    },
  ],
  [NotificationType.DefiNotificationsAlerts]: [
    {
      text: '🔗 Open status page',
      url: 'https://services-healthpage.orbs.network/#/defi-notifications',
    },
  ],
  [NotificationType.EvmNodesStatus]: [
    { text: '🔗 Open status page', url: 'https://services-healthpage.orbs.network/#/evm-nodes' },
  ],
  [NotificationType.EvmNodesAlerts]: [
    { text: '🔗 Open status page', url: 'https://services-healthpage.orbs.network/#/evm-nodes' },
  ],
  [NotificationType.PerpsDailyReport]: [
    { text: '🔗 View STAGING', url: 'https://staging-perps.orbs.network' },
    { text: '🔗 View PROD', url: 'https://prod-perps.orbs.network' },
  ],
  [NotificationType.PerpsExposureAlertsProd]: [
    { text: '🔗 See on PROD', url: 'https://prod-perps.orbs.network/exposure' },
  ],
  [NotificationType.PerpsExposureAlertsStaging]: [
    { text: '🔗 See on STAGING', url: 'https://staging-perps.orbs.network/exposure' },
  ],
  [NotificationType.Solver]: [
    { text: '🔗 Open status page', url: 'https://utils.orbs.network/orbs-solver/status' },
  ],
  [NotificationType.SolverAlerts]: [
    { text: '🔗 Open status page', url: 'https://utils.orbs.network/orbs-solver/status' },
  ],
};

export const AlertTypes = [
  NotificationType.WalletManagerAlerts,
  NotificationType.TwapAlerts,
  NotificationType.LiquidityHubAlerts,
  NotificationType.DefiNotificationsAlerts,
  NotificationType.EvmNodesAlerts,
  NotificationType.PerpsExposureAlertsProd,
  NotificationType.PerpsExposureAlertsStaging,
  NotificationType.SolverAlerts,
];

export const StatusTypes = [
  NotificationType.WalletManager,
  NotificationType.Twap,
  NotificationType.LiquidityHub,
  NotificationType.DefiNotifications,
  NotificationType.EvmNodesStatus,
  NotificationType.PerpsDailyReport,
  NotificationType.Solver,
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
  count: number;
  sent: boolean;
};
