import { Level } from '../models/level';

export class LeaderboardFormatterService {
  FormatStats(
    channel: string,
    duration: 'Weekly' | 'Monthly',
    stat: 'Gold' | 'Kills' | 'RP',
    leaderboard: { [user: string]: number }
  ): string {
    let messageString = `>  __**${duration} ${channel} ${stat} Leaders**__
>  
`;
    const leaderTable = [];
    for (const key in leaderboard) {
      if (Object.prototype.hasOwnProperty.call(leaderboard, key)) {
        leaderTable.push({ user: key, stat: leaderboard[key] });
      }
    }
    leaderTable
      .sort((a, b) => b.stat - a.stat)
      .forEach((x, i) => {
        messageString += `>  ${i + 1}. **${x.user}** *${stat}*: ${x.stat}\n`;
      });
    return messageString;
  }
  FormatLevels(
    channel: string,
    duration: 'Weekly' | 'Monthly',
    leaderboard: { [user: string]: Level }
  ): string {
    let messageString = `>  __**${duration} ${channel} Level Leaders**__
>  
`;
    const leaderTable = [];
    for (const key in leaderboard) {
      if (Object.prototype.hasOwnProperty.call(leaderboard, key)) {
        leaderTable.push({ user: key, ...leaderboard[key] });
      }
    }
    leaderTable
      .sort(
        (a, b) =>
          (b.prestige * 200 + b.level) * 1000 +
          b.xp -
          ((a.prestige * 200 + a.level) * 1000 + a.xp)
      )
      .forEach((x, i) => {
        messageString += `>  ${i + 1}. **${x.user}** *Prestige*: ${
          x.prestige
        } *Level*: ${x.level} *XP*: ${x.xp}\n`;
      });
    return messageString;
  }
}
