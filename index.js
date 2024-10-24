require('dotenv').config();
const express = require('express');
const {
  Client,
  GatewayIntentBits,
  Partials,
  ApplicationCommandOptionType,
  ChannelType,
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.User],
});

let lastVideoId = null;

const reactionRolesMap = new Map([
  ['🔴', 'red_role'],
  ['👍', 'user'],
]);

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const data = {
    name: 't-message',
    description: 'Send a message to a specified channel',
    options: [
      {
        type: ApplicationCommandOptionType.Channel,
        name: 'channel',
        description: 'The channel to send the message to',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'message',
        description: 'The message to send',
        required: true,
      },
    ],
  };

  await client.application.commands.create(data);
  console.log('Slash command registered.');

  // Express server setup within the ready event
  const app = express();
  app.use(express.json());

  app.post('/send-news', async (req, res) => {
    const { message, url } = req.body;
    const channelId = '1208062375845040248'; // Your tech-news channel ID
    const channel = client.channels.cache.get(channelId);
    const discordMessage = `${message}\n${url}`;

    if (channel) {
      try {
        await channel.send(discordMessage);
        res.status(200).json({ message: 'News sent successfully!' });
      } catch (error) {
        console.error('Failed to send news:', error);
        res.status(500).json({ message: 'Failed to send news' });
      }
    } else {
      res.status(404).json({ message: 'Channel not found' });
    }
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 't-message') {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options
      .getString('message')
      .split('\\n')
      .join('\n');

    if (channel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: 'Please select a text channel.',
        ephemeral: true,
      });
      return;
    }

    channel
      .send(message)
      .then(() => {
        interaction.reply({
          content: `Message sent to ${channel.name}`,
          ephemeral: true,
        });
      })
      .catch((error) => {
        console.error('Error sending message:', error);
        interaction.reply({
          content: 'There was an error while sending the message.',
          ephemeral: true,
        });
      });
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  // Your existing reaction roles logic
});

client.on('messageReactionRemove', async (reaction, user) => {
  // Your existing reaction roles logic
});

client.login(process.env.DISCORD_BOT_TOKEN_T_ROLES);
