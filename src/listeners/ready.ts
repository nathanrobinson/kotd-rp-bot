import { Client, TextChannel } from 'discord.js';
import { ChannelConfig } from '../models/channel-config';
import { Leaderboard } from '../models/leaderboard';
import { RaceLeaderboard } from '../models/race-leaderboard';
import { channelConfig } from '../config';
import { GuildChannel } from '../models/guild-channel';
import { LeaderboardParserService } from '../services/leaderboard-parser.service';
import { LeaderboardFormatterService } from '../services/leaderboard-formatter.service';
import { CloudStorageService } from '../services/cloud-storage.service';

export const readyListener = (client: Client): void => {
  client.on('ready', async () => {
    if (!client.user || !client.application) {
      return;
    }

    const cloudStorage = new CloudStorageService();

    const leaderboard: Leaderboard =
      (await cloudStorage.getLeaderboard()) || {};
    let channel: keyof ChannelConfig;
    let shouldUpdate = false;
    for (channel in channelConfig) {
      if (channelConfig.hasOwnProperty(channel)) {
        const textChannel = getGuildChannel(client, channelConfig[channel]);
        if (!!textChannel) {
          shouldUpdate =
            (await getLeaderboard(textChannel, channel, leaderboard)) ||
            shouldUpdate;
          await sendLeaderboard(textChannel, channel, leaderboard[channel]);
        }
      }
    }

    if (shouldUpdate) {
      await cloudStorage.saveLeaderboard(leaderboard);
    }

    client.destroy();
  });
};

async function sendLeaderboard(
  textChannel: TextChannel,
  channel: keyof ChannelConfig,
  leaderboard: RaceLeaderboard | undefined
) {
  if (!!leaderboard) {
    const formatter = new LeaderboardFormatterService();
    await textChannel.send(
      formatter.FormatLevels(channel, 'Weekly', leaderboard.deltaW.levels)
    );
    await textChannel.send(
      formatter.FormatStats(channel, 'Weekly', 'Gold', leaderboard.deltaW.gold)
    );
    await textChannel.send(
      formatter.FormatStats(
        channel,
        'Weekly',
        'Kills',
        leaderboard.deltaW.kills
      )
    );
    await textChannel.send(
      formatter.FormatStats(channel, 'Weekly', 'RP', leaderboard.deltaW.rp)
    );
  }
}

function getGuildChannel(
  client: Client,
  guildChannel: GuildChannel | undefined
): TextChannel | undefined {
  if (!!guildChannel?.guild && !!guildChannel.channel) {
    const guild = client.guilds.cache.get(guildChannel.guild);
    if (!!guild) {
      const textChannel = guild?.channels.cache.get(
        guildChannel.channel
      ) as TextChannel;
      return textChannel;
    }
  }
  return undefined;
}

async function getLeaderboard(
  textChannel: TextChannel,
  channel: keyof ChannelConfig,
  leaderboard: Leaderboard
) {
  await textChannel.send(`!lb ${channel}`);

  const messages = await textChannel.awaitMessages({
    filter: (x) => x.content.includes('Leaderboard'),
    max: 4,
    time: 90000,
    idle: 60000,
  });

  const parser = new LeaderboardParserService();
  const gotResponse = !!messages?.size;

  if (gotResponse) {
    for (const [_, message] of messages) {
      leaderboard[channel] = parser.parseMessage(message, leaderboard[channel]);
    }
  }
  return gotResponse;
}
