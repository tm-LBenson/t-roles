require('dotenv').config();
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
    (r) => r.name === roleName,
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
    (r) => r.name === roleName,
  );
  const member = reaction.message.guild.members.cache.get(user.id);

  if (role && member) {
    member.roles.remove(role).catch(console.error);
    console.log(
      `Role "${role.name}" has been removed from user "${user.tag}".`,
    );
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
