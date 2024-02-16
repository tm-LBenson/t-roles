require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  partials: ['MESSAGE', 'REACTION', 'USER'], // Needed for handling reactions on old messages
});

const reactionRolesMap = new Map([
  ['🔴', 'red_role'],
  ['👍', 'user'],
]);

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
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
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
