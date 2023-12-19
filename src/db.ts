import sqlite3 from 'sqlite3';
import { Notification } from './types';

export class Database {
  private db;

  constructor() {
    this.db = new sqlite3.Database('orbs-status-bot.db');

    const createNotificationsTable = `
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY NOT NULL,
        chatId INTEGER NOT NULL,
        notificationType TEXT NOT NULL
      )
    `;

    this.db.run(createNotificationsTable);
  }

  async insert(newNotification: Omit<Notification, 'id'>): Promise<boolean> {
    const { chatId, notificationType } = newNotification;

    const id = `${chatId}:${notificationType}`;

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
        (err, rows: Notification[]) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(rows);
        }
      );
    });
  }

  get(id: string): Promise<Notification> {
    return new Promise<Notification>((resolve, reject) => {
      this.db.get('SELECT * FROM notifications WHERE id = ?', [id], (err, row: Notification) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(row);
      });
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
}
