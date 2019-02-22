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

let Discord = require("discord.js");
let client = new Discord.Client({ disabledEvents: eventsToDisable });


function stripHyphen(string) {
    return string.split('-').join("")
}

const channels = new Discord.Collection();

client.once('ready', () => {
    // Load custom from the file
    AdditionalChanToRoles.forEach(additional => {
        channels.set(additional.channelID, new PagerChannel(additional))
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
                        console.log(`Adding Role:${guild.roles.get(role.id)} to ${channel}`);
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
        if (message.content.startsWith("!") || message.content.startsWith("?")) return;
        message.channel.fetchMessages({ limit: 4 }).then(messages => {
            let msg_array = messages.array();
            msg_array = msg_array.filter(message => message.author.id === client.user.id);
            msg_array.map(message => message.delete().catch(console.error));
        });
        if (message.channel.id === "293580875176738817") {
            message.channel.send(["<@&" + chanToRole[message.channel.id] + "> We strongly encourage everyone to utilize The Silph Road Nest Atlas for nest reporting and lookup but please feel free to note any exceptionally good nests here, https:\/\/thesilphroad.com/atlas#11.46/43.082/-89.37"]);
        } else if (message.channel.id === "291795781885886464") {
            message.channel.send("Please be sure to check out the server FAQ at http:\/\/madpogotracker.info/faq and/or <#301194349977534465> for current server status.  <@&" + chanToRole[message.channel.id] + ">");
        } else {
            message.channel.send("New message! <@&" + chanToRole[message.channel.id] + ">");
        }
    }
});

client.login(process.env.TOKEN);