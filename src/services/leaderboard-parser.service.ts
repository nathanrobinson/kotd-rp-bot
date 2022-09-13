import { Message } from 'discord.js';
import { Stats } from '../models/stats';
import { Level } from '../models/level';
import { RaceLeaderboard } from '../models/race-leaderboard';

export class LeaderboardParserService {
  public parseMessage(
    message: Message<boolean>,
    lb: RaceLeaderboard | undefined
  ): RaceLeaderboard {
    lb = lb || this.newRaceLeaderboard();

    const content = message?.content || '';

    if (content.includes('Levels Leaderboard')) {
      this.parseLevels(content, lb);
    } else if (content.includes('Gold Leaderboard')) {
      this.parseGold(content, lb);
    } else if (content.includes('Kill Leaderboard')) {
      this.parseKills(content, lb);
    } else if (content.includes('RP Leaderboard')) {
      this.parseRP(content, lb);
    }
    return lb;
  }

  private newRaceLeaderboard(): RaceLeaderboard {
    return {
      previous: this.newStats(),
      deltaW: this.newStats(),
      deltaM: this.newStats(),
    };
  }

  private newStats(): Stats {
    return {
      levels: {},
      gold: {},
      kills: {},
      rp: {},
    };
  }

  private parseLevels(message: string, lb: RaceLeaderboard) {
    const re =
      /\d+\. (?<player>\w+)\n.*Prestige: (?<prestige>\d+), Level: (?<level>\d+), XP: (?<xp>\d+)/;
    const matches = this.matchMultiple(message, re, (x) => ({
      player: String(x.player),
      prestige: Number(x.prestige),
      level: Number(x.level),
      xp: Number(x.xp),
    }));
    const newPrevious: { [name: string]: Level } = {};
    lb.deltaW.levels = {};
    if (new Date().getDate() <= 7) {
      lb.deltaM.levels = {};
    }
    for (const match of matches) {
      newPrevious[match.player] = match;
      const previous = lb.previous.levels[match.player];
      const delta = {
        prestige: match.prestige - (previous?.prestige || 0),
        level: match.level - (previous?.level || 0),
        xp: match.xp - (previous?.xp || 0),
      };
      lb.deltaW.levels[match.player] = delta;
      const dm = lb.deltaM.levels[match.player];
      const deltaM = {
        prestige: match.prestige - (dm?.prestige || 0),
        level: match.level - (dm?.level || 0),
        xp: match.xp - (dm?.xp || 0),
      };
      lb.deltaM.levels[match.player] = deltaM;
    }
    lb.previous.levels = newPrevious;
  }

  private parseGold(message: string, lb: RaceLeaderboard) {
    const re = /\d+\. (?<player>\w+)\n.*Gold: (?<gold>\d+)/;
    const matches = this.matchMultiple(message, re, (x) => ({
      player: String(x.player),
      gold: Number(x.gold),
    }));
    const newPrevious: { [name: string]: number } = {};
    lb.deltaW.gold = {};
    if (new Date().getDate() <= 7) {
      lb.deltaM.gold = {};
    }
    for (const match of matches) {
      newPrevious[match.player] = match.gold;
      const previous = lb.previous.gold[match.player] || 0;
      lb.deltaW.gold[match.player] =
        previous <= match.gold ? match.gold - previous : match.gold;
      const dm = lb.deltaM.gold[match.player];
      lb.deltaM.gold[match.player] =
        dm <= match.gold ? match.gold - dm : match.gold;
    }
    lb.previous.gold = newPrevious;
  }

  private parseKills(message: string, lb: RaceLeaderboard) {
    const re = /\d+\. (?<player>\w+)\n.*Kills: (?<kills>\d+)/;
    const matches = this.matchMultiple(message, re, (x) => ({
      player: String(x.player),
      kills: Number(x.kills),
    }));
    const newPrevious: { [name: string]: number } = {};
    lb.deltaW.kills = {};
    if (new Date().getDate() <= 7) {
      lb.deltaM.kills = {};
    }
    for (const match of matches) {
      newPrevious[match.player] = match.kills;
      const previous = lb.previous.kills[match.player] || 0;
      lb.deltaW.kills[match.player] =
        previous <= match.kills ? match.kills - previous : match.kills;
      const dm = lb.deltaM.kills[match.player];
      lb.deltaM.kills[match.player] =
        dm <= match.kills ? match.kills - dm : match.kills;
    }
    lb.previous.kills = newPrevious;
  }

  private parseRP(message: string, lb: RaceLeaderboard) {
    const re = /\d+\. (?<player>\w+)\n.*RP: (?<rp>\d+)/;
    const matches = this.matchMultiple(message, re, (x) => ({
      player: String(x.player),
      rp: Number(x.rp),
    }));
    const newPrevious: { [name: string]: number } = {};
    lb.deltaW.rp = {};
    if (new Date().getDate() <= 7) {
      lb.deltaM.rp = {};
    }
    for (const match of matches) {
      newPrevious[match.player] = match.rp;
      const previous = lb.previous.rp[match.player] || 0;
      lb.deltaW.rp[match.player] =
        previous <= match.rp ? match.rp - previous : match.rp;
      const dm = lb.deltaM.rp[match.player];
      lb.deltaM.rp[match.player] = dm <= match.rp ? match.rp - dm : match.rp;
    }
    lb.previous.rp = newPrevious;
  }

  private matchMultiple<T>(
    source: string,
    re: RegExp,
    mapper: (match: { [key: string]: string }) => T
  ): T[] {
    const matches = source.match(new RegExp(re, 'g'));
    const results = [];
    if (matches)
      for (const matchString of matches) {
        const match = matchString.match(re);
        if (!!match?.groups) {
          results.push(mapper(match.groups));
        }
      }
    return results;
  }
}
