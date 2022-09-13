import { Client, GatewayIntentBits } from 'discord.js';
import { readyListener } from './listeners/ready';

const token = process.env.DISCORD_BOT_TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

readyListener(client);

client.login(token);
