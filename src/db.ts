import { config } from './config';
import { Alert, AlertDb, Notification, NotificationType } from './types';
import { Database as DB } from '@sqlitecloud/drivers';

export class Database {
  private db;

  constructor() {
    // this.db = new sqlite3.Database('orbs-status-bot.db');

    if (!config.DBConnectionString) {
      throw new Error('DB connection string is not defined');
    }

    this.db = new DB(config.DBConnectionString);

    const createNotificationsTable = `
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY NOT NULL,
        chatId INTEGER NOT NULL,
        notificationType TEXT NOT NULL
      )
    `;

    this.db.run(createNotificationsTable);

    const createAlertsTable = `
      DROP TABLE IF EXISTS alerts;

      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY NOT NULL,
        timestamp INTEGER NOT NULL,
        count INTEGER DEFAULT 1
        sent BOOLEAN DEFAULT FALSE
      );
    `;

    this.db.run(createAlertsTable);
  }

  getId({
    chatId,
    notificationType,
  }: {
    chatId: number;
    notificationType: NotificationType;
  }): string {
    return `${chatId}:${notificationType}`;
  }

  async insert(newNotification: Omit<Notification, 'id'>): Promise<boolean> {
    const { chatId, notificationType } = newNotification;

    const id = this.getId({ chatId, notificationType });

    // Check if notification already exists
    try {
      const notification = await this.get(id);
      if (notification) {
        return Promise.reject(new Error('Notification already exists'));
      }
    } catch (err) {
      // Notification does not exist
    }

    return new Promise<boolean>((resolve, reject) => {
      const insert = `
        INSERT INTO notifications (id, chatId, notificationType)
        VALUES (?, ?, ?)
      `;

      this.db.run(insert, [id, chatId, notificationType], (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(true);
      });
    });
  }

  getAll(): Promise<Notification[]> {
    return new Promise<Notification[]>((resolve, reject) => {
      this.db.all('SELECT * FROM notifications', (err, rows: Notification[]) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(rows);
      });
    });
  }

  getByChatId(chatId: number): Promise<Notification[]> {
    return new Promise<Notification[]>((resolve, reject) => {
      this.db.all(
        'SELECT * FROM notifications WHERE chatId = ?',
        [chatId],
        (err, rows: Notification[] | undefined) => {
          if (err) {
            reject(err);
            return;
          }

          if (!rows) {
            resolve([]);
            return;
          }

          resolve(rows);
        }
      );
    });
  }

  getByNotificationType(notificationType: NotificationType): Promise<Notification[]> {
    return new Promise<Notification[]>((resolve, reject) => {
      this.db.all(
        'SELECT * FROM notifications WHERE notificationType = ?',
        [notificationType],
        (err, rows: Notification[] | undefined) => {
          if (err) {
            reject(err);
            return;
          }

          if (!rows) {
            resolve([]);
            return;
          }

          resolve(rows);
        }
      );
    });
  }

  get(id: string): Promise<Notification | undefined> {
    return new Promise<Notification | undefined>((resolve, reject) => {
      this.db.get(
        'SELECT * FROM notifications WHERE id = ?',
        [id],
        (err, row: Notification | undefined) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(row);
        }
      );
    });
  }

  delete(id: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.db.run('DELETE FROM notifications WHERE id = ?', [id], (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(true);
      });
    });
  }

  deleteAll(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.db.run('DELETE FROM notifications', (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(true);
      });
    });
  }

  deleteByChatId(chatId: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.db.run('DELETE FROM notifications WHERE chatId = ?', [chatId], (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(true);
      });
    });
  }

  getAlertId({ notificationType, alertType, name }: Alert): string {
    return `${notificationType}:${alertType}:${name}`;
  }

  async getAlert(alert: Alert): Promise<AlertDb | undefined> {
    const id = this.getAlertId(alert);

    return new Promise<AlertDb | undefined>((resolve, reject) => {
      this.db.get('SELECT * FROM alerts WHERE id = ?', [id], (err, row: AlertDb | undefined) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(row);
      });
    });
  }

  async getAlertById(id: string): Promise<AlertDb | undefined> {
    return new Promise<AlertDb | undefined>((resolve, reject) => {
      this.db.get('SELECT * FROM alerts WHERE id = ?', [id], (err, row: AlertDb | undefined) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(row);
      });
    });
  }

  async insertAlert(newAlert: Alert): Promise<boolean> {
    const id = this.getAlertId(newAlert);

    // Check if alert already exists
    try {
      const alert = await this.getAlert(newAlert);
      if (alert) {
        return Promise.reject(false);
      }
    } catch (err) {
      // Alert does not exist
    }

    return new Promise<boolean>((resolve, reject) => {
      const insert = `
        INSERT INTO alerts (id, timestamp)
        VALUES (?, ?)
      `;

      this.db.run(insert, [id, newAlert.timestamp], (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(true);
      });
    });
  }

  async appendAlertCount(id: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const update = `
        UPDATE alerts
        SET count = count + 1
        WHERE id = ?
      `;

      this.db.run(update, [id], (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(true);
      });
    });
  }

  async sentAlert(id: string, timestamp: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const update = `
        UPDATE alerts
        SET sent = TRUE, timestamp = ?
        WHERE id = ?
      `;

      this.db.run(update, [timestamp, id], (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(true);
      });
    });
  }

  async deleteAlert(id: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.db.run('DELETE FROM alerts WHERE id = ?', [id], (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(true);
      });
    });
  }

  deleteAllAlerts(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.db.run('DELETE FROM alerts', (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(true);
      });
    });
  }
}
