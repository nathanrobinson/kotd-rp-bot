import { Storage } from '@google-cloud/storage';
import { Leaderboard } from '../models/leaderboard';

export class CloudStorageService {
  private fileName = 'leaderboard.json';
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.LEADERBOARD_BUCKET_NAME || '';
  }

  public async getLeaderboard() {
    const storage = new Storage();
    const contents =
      (
        await storage.bucket(this.bucketName)?.file(this.fileName)?.download()
      )?.toString() || '{}';
    return JSON.parse(contents) as Leaderboard;
  }

  public async saveLeaderboard(leaderboard: Leaderboard) {
    const storage = new Storage();
    await storage
      .bucket(this.bucketName)
      ?.file(this.fileName)
      .save(JSON.stringify(leaderboard));
  }
}
