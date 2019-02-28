const AdditionalChanToRoles = require('./AdditionalChanToRole.js')
const PagerChannel = require('./PagerChannel.js')
const result = require('dotenv').config()
const Enmap = require('enmap');

if (result.error) {
    throw result.error
}

// EVENTS TO DISABLE TO SAVE MEMORY AND CPU
const eventsToDisable = ['channelCreate', 'channelDelete', 'channelPinsUpdate', 'channelUpdate', 'clientUserGuildSettingsUpdate', 'clientUserSettingsUpdate',
    'disconnect', 'emojiCreate', 'emojiDelete', 'emojiUpdate', 'guildBanAdd', 'guildBanRemove', 'guildCreate', 'guildDelete',
    'guildMemberAvailable', 'guildMembersChunk', 'guildMemberSpeaking', 'guildMemberUpdate', 'guildUnavailable', 'guildUpdate', 'messageDelete',
    'messageDeleteBulk', 'messageReactionRemove', 'messageReactionRemoveAll', 'messageUpdate', 'presenceUpdate', 'reconnecting', 'resume',
    'roleCreate', 'roleDelete', 'roleUpdate', 'typingStart', 'typingStop', 'userNoteUpdate', 'userUpdate', 'voiceStateUpdate'
];

const Discord = require("discord.js");
const client = new Discord.Client({ disabledEvents: eventsToDisable });


function stripHyphen(string) {
    return string.split('-').join("")
}

const channelStorage = new Enmap({ name: "PagerChannels" });
/** @type {Discord.Collection<Discord.Snowflake, PagerChannel>} */
const channels = new Discord.Collection();


const responseObject = {
    "!gryffindor": "\nYou might belong in Gryffindor,\nWhere dwell the brave at heart,\nTheir daring, nerve, and chivalry\nSet Gryffindors apart.",
    "!ravenclaw": "\nOr yet in wise old Ravenclaw,\nIf you've a ready mind,\nWhere those of wit and learning,\nWill always find their kind.",
    "!hufflepuff": "\nYou might belong in Hufflepuff,\nWhere they are just and loyal,\nThose patient Hufflepuffs are true,\nAnd unafraid of toil.",
    "!slytherin": "\nOr perhaps in Slytherin,\nYou'll make your real friends,\nThose cunning folk use any means,\nTo achieve their ends."
}

client.on('guildMemberAdd', async(guildMember) => {
    //TODO: Send Welcome message with details on what to do, ask for what regions they'd like to be in, offer map
});
client.on('message', message => {
    if (false /* message is in the sortinghat channel */ ) {

    } else if (message.content) {
        if (message.author.bot) return;
        if (message.content.startsWith("!") || message.content.startsWith("?") || message.content.startsWith(".")) return;
        if (channels.has(message.channel.id)) {
            message.channel.send(channels.get(message.channel.id).toString()).then((newMessage) => {
                channels.get(message.channel.id).lastmessage = newMessage;
                channelStorage.set(message.channel.id, channels.get(message.channel.id).toEnmap())
            });
        }
    }

    /**Easter Egg Stuff */
    if (responseObject[message.content]) {
        message.reply(responseObject[message.content]);
    }
});
client.once('ready', async() => {
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


client.login(process.env.TOKEN);