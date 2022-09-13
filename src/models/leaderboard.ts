import { RaceLeaderboard } from './race-leaderboard';

export interface Leaderboard {
  orc?: RaceLeaderboard;
  dwarf?: RaceLeaderboard;
  elf?: RaceLeaderboard;
  halfling?: RaceLeaderboard;
}
