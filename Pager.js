const AdditionalChanToRoles = require('./AdditionalChanToRole.js')
const PagerChannel = require('./PagerChannel.js')
const result = require('dotenv').config()
const Enmap = require('enmap');

if (result.error) {
    throw result.error
}

const Discord = require("discord.js");
const client = new Discord.Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] });


function stripHyphen(string) {
    return string.split('-').join("")
}

/** @type {Discord.Collection<Discord.Snowflake, PagerChannel>} */
const channelStorage = new Enmap({ name: "PagerChannels" });
const channels = new Discord.Collection();


client.once('ready', async () => {
    //Load from Enmap
    await channelStorage.defer;
    channelStorage.forEach(channelData => channels.set(channelData.channelID, new PagerChannel(client, channelData)));

    // Load new custom values from the file
    AdditionalChanToRoles.forEach(additional => {
        //it wasn't in the enmap, so load it fresh
        if (!channels.has(additional.channelID)) {
            channels.set(additional.channelID, new PagerChannel(client, additional))
            console.log(`Adding Role From File. Role:${additional.roleID}, Channel:${additional.channelID}`)
        }
        //it WAS in the enmap, so grab the most recent message from the enmap and add it to the data from the file
        else {
            additional.messageID = channelStorage.get(additional.channelID).messageID
            channels.set(additional.channelID, new PagerChannel(client, additional))
        }
    });
    // load matching from the guilds
    // for each guild
    client.guilds.cache.forEach((guild) => {
        // for each channel
        guild.channels.cache.forEach((channel) => {
            // if the channel isn't already paired with a role
            if (!channels.has(channel.id)) {
                // for each role in the guild
                guild.roles.cache.forEach((role) => {
                    // if the role matches the channel
                    if (role.name == stripHyphen(channel.name)) {
                        // if the channel already has a role matched
                        if (!channels.has(channel.id)) {
                            channels.set(channel.id, new PagerChannel(client, { channelID: channel.id, roleID: role.id }));
                        }
                        console.log(`Adding Role:${guild.roles.get(role.id).name} to ${channel.name}`);
                    }
                });
            }
        });
    });
    console.log('Pager is ready!');
});


client.on('messageCreate', message => {
    if (message.content) {
        if (message.author.bot) return;
        if (message.content.startsWith("!") || message.content.startsWith("?") || message.content.startsWith(".")) return;
        if (channels.has(message.channel.id)) {
            message.channel.send(channels.get(message.channel.id).toString()).then((newMessage) => {
                channels.get(message.channel.id).lastmessage = newMessage;
                channelStorage.set(message.channel.id, channels.get(message.channel.id).toEnmap())
            });
        }

    }
});

client.login(process.env.TOKEN);