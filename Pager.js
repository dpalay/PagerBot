const AdditionalChanToRoles = require('./AdditionalChanToRole.js')
const PagerChannel = require('./PagerChannel.js')
const result = require('dotenv').config()

if (result.error) {
    throw result.error
}

// EVENTS TO DISABLE TO SAVE MEMORY AND CPU
const eventsToDisable = ['channelCreate', 'channelDelete', 'channelPinsUpdate', 'channelUpdate', 'clientUserGuildSettingsUpdate', 'clientUserSettingsUpdate',
    'disconnect', 'emojiCreate', 'emojiDelete', 'emojiUpdate', 'guildBanAdd', 'guildBanRemove', 'guildCreate', 'guildDelete', 'guildMemberAdd',
    'guildMemberAvailable', 'guildMembersChunk', 'guildMemberSpeaking', 'guildMemberUpdate', 'guildUnavailable', 'guildUpdate', 'messageDelete',
    'messageDeleteBulk', 'messageReactionRemove', 'messageReactionRemoveAll', 'messageUpdate', 'presenceUpdate', 'reconnecting', 'resume',
    'roleCreate', 'roleDelete', 'roleUpdate', 'typingStart', 'typingStop', 'userNoteUpdate', 'userUpdate', 'voiceStateUpdate'
];

const Discord = require("discord.js");
const client = new Discord.Client({ disabledEvents: eventsToDisable });


function stripHyphen(string) {
    return string.split('-').join("")
}

/** @type {Discord.Collection<Discord.Snowflake, PagerChannel>} */
const channels = new Discord.Collection();

client.once('ready', () => {
    // Load custom from the file
    AdditionalChanToRoles.forEach(additional => {
        channels.set(additional.channelID, new PagerChannel(additional))
        console.log(`Adding Role From File. Role:${additional.roleID}, Channel:${additional.channelID}`)
    });
    // load matching from the guilds
    // for each guild
    client.guilds.forEach((guild) => {
        // for each channel
        guild.channels.forEach((channel) => {
            // if the channel isn't already paired with a role
            if (!channels.has(channel.id)) {
                // for each role in the guild
                guild.roles.forEach((role) => {
                    // if the role matches the channel
                    if (role.name == stripHyphen(channel.name)) {
                        // if the channel already has a role matched
                        if (!channels.has(channel.id)) {
                            channels.set(channel.id, new PagerChannel({ channelID: channel.id, roleID: role.id }));
                        }
                        console.log(`Adding Role:${guild.roles.get(role.id).name} to ${channel.name}`);
                    }
                });
            }
        });
    });
    console.log('Pager is ready!');
});


client.on('message', message => {
    if (message.content) {
        if (message.author.bot) return;
        if (message.content.startsWith("!") || message.content.startsWith("?") || message.content.startsWith(".")) return;
        if (channels.has(message.channel.id)) {
            message.channel.send(channels.get(message.channel.id).toString()).then((newMessage) => {
                channels.get(message.channel.id).lastmessage = newMessage;
            });
        }

    }
});

client.login(process.env.TOKEN);