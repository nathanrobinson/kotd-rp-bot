import { Level } from "./level";

export interface Stats {
  levels: { [user: string]: Level };
  gold: { [user: string]: number };
  kills: { [user: string]: number };
  rp: { [user: string]: number };
}
