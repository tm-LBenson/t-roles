require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  ApplicationCommandOptionType,
  ChannelType,
} = require('discord.js');
const { google } = require('googleapis');
const youtube = google.youtube('v3');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.User],
});

const CHECK_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
const CHANNEL_ID = 'UCeeFfhMcJa1kjtfZAGskOCA'; // Replace with the actual channel ID
let lastVideoId = null;

const reactionRolesMap = new Map([
  ['🔴', 'red_role'],
  ['👍', 'user'],
]);
async function checkForNewVideos() {
  youtube.search.list(
    {
      key: process.env.YOUTUBE_API_KEY,
      channelId: CHANNEL_ID,
      order: 'date',
      part: 'snippet',
      type: 'video',
      maxResults: 1,
    },
    (err, response) => {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      }

      const latestVideo = response.data.items[0];
      if (!latestVideo) {
        console.log('No video found.');
        return;
      }

      if (lastVideoId !== latestVideo.id.videoId) {
        lastVideoId = latestVideo.id.videoId;
        const videoUrl = `https://www.youtube.com/watch?v=${latestVideo.id.videoId}`;
        const message = `New video by TechLinked: ${latestVideo.snippet.title} - ${videoUrl}`;

        sendMessageToChannel(message);
      }
    }
  );
}

function sendMessageToChannel(message) {
  const channel = client.channels.cache.get('1208062375845040248');
  if (channel) {
    channel.send(message);
  } else {
    console.log('Channel not found.');
  }
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  setInterval(checkForNewVideos, CHECK_INTERVAL);
  checkForNewVideos();
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
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the message:', error);
      return;
    }
  }

  if (reaction.message.partial) {
    try {
      await reaction.message.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the message:', error);
      return;
    }
  }

  const roleName = reactionRolesMap.get(reaction.emoji.name);
  const role = reaction.message.guild.roles.cache.find(
    (r) => r.name === roleName
  );
  const member = reaction.message.guild.members.cache.get(user.id);

  if (role && member) {
    member.roles.add(role).catch(console.error);
    console.log(`Role "${role.name}" has been added to user "${user.tag}".`);
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the message:', error);
      return;
    }
  }

  if (reaction.message.partial) {
    try {
      await reaction.message.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the message:', error);
      return;
    }
  }

  const roleName = reactionRolesMap.get(reaction.emoji.name);
  const role = reaction.message.guild.roles.cache.find(
    (r) => r.name === roleName
  );
  const member = reaction.message.guild.members.cache.get(user.id);

  if (role && member) {
    member.roles.remove(role).catch(console.error);
    console.log(
      `Role "${role.name}" has been removed from user "${user.tag}".`
    );
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
