import { Stats } from './stats';

export interface RaceLeaderboard {
  previous: Stats;
  deltaW: Stats;
  deltaM: Stats;
}
