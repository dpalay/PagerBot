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


function stripHyphenAndWhiteSpace(string) {
    return string.replace(/[\s -]/g, "");
}

/**
 * @param {string} string
 */
function reduceName(string) {
    return string.toLowerCase().replace(/[\W]+/g, "");
}

/**
 * 
 * @param {Discord.GuildMember} guildMember 
 * @param {Discord.Collection<String, {role: Discord.Snowflake, channel: Discord.Snowflake}} houses
 */
function houseAssigned(guildMember, houses) {
    return guildMember.roles.some((role) => houses.find((house) => {}))
}

/** @type {Enmap<string, {channelID: string, accessRoleID: string, raidRoleID: string, message: string, messageID: string, locked: boolean, lockedMessage}} */
const channelStorage = new Enmap({ name: "PagerChannels" });
/** @type {Discord.Collection<Discord.Snowflake, PagerChannel>} */
const channels = new Discord.Collection();


const responseObject = {
    "!gryffindor": "\nYou might belong in Gryffindor,\nWhere dwell the brave at heart,\nTheir daring, nerve, and chivalry\nSet Gryffindors apart.",
    "!ravenclaw": "\nOr yet in wise old Ravenclaw,\nIf you've a ready mind,\nWhere those of wit and learning,\nWill always find their kind.",
    "!hufflepuff": "\nYou might belong in Hufflepuff,\nWhere they are just and loyal,\nThose patient Hufflepuffs are true,\nAnd unafraid of toil.",
    "!slytherin": "\nOr perhaps in Slytherin,\nYou'll make your real friends,\nThose cunning folk use any means,\nTo achieve their ends."
}

/**@type {Discord.Collection<String, {role: Discord.Snowflake, channel: Discord.Snowflake}} */
const houses = new Discord.Collection()
houses.set("Hufflepuff", { role: process.env.HufflepuffRole, channel: process.env.houseHufflepuff })
houses.set("Slytherin", { role: process.env.SlytherinRole, channel: process.env.houseSlytherin })
houses.set("Gryffindor", { role: process.env.GryffindorRole, channel: process.env.houseGryffindor })
houses.set("Ravenclaw", { role: process.env.RavenclawRole, channel: process.env.houseRavenclaw });



const emoji = { houses: { ready: false } }

client.on('guildMemberAdd', (guildMember) => {
    //TODO: Send Welcome message with details on what to do, ask for what regions they'd like to be in, offer map 
    client.channels.get(process.env.sortingHatChannel).send(
        `Greetings ${guildMember.toString}. Welcome to the Madison Area Pokemon GO Discord server.  We're really excited to have you here.
We know that the server can be a little intimidating to people who aren't familiar with it, so I wanted to explain how to use this server.  
We have broken Madison down into different geographical regions.  These regions have their own set of channels for people to use to chat and coordinate raids.
Each of the regions is hidden from view by default, soas to not clutter your screen.  You need to ask for access to them, and this is where you can do so.  All you need to do is type \`+<regionname>\` here in this channel.  
Doing so will unlock the channels for that region.  You can add as many regions as you'd like (with some restrictions for protected regions). If you find that you no longer want the channels from that region, just type \`-<regionname>\` and I'll go and remove them from your list.
For example, to add the  "Southern Madison" region, named "Mad South", you would just need to type \`+madsouth\`, and I'll grant you access to those channels.
If you'd like to be notified of raids in your chosen region, you can instead type \`+raid<region name>\`. This will give you access to that region's chats, but also will set you up to be notified whenever a new message is posted in that region's raid channel.
Just like with the region itself, you can always come here and type \`-raid<regionname>\` to turn off those notifications.  You'll still be in the region though, so if you want to remove it completely you would type \`-<regionname>\`.
You can find a map of all the regions here: https://www.google.com/maps/d/viewer?mid=119FKgOZFGaPKYHTAsky3oWE0ElIYNg1p&ll=43.08279326813467%2C-89.20724750000005&z=13
Got it?  Give it a try!

\`+regionName\` - adds region
\`+raidRegionName\` - adds region and subscribes to notifications for that region
\`-regionName\` - removes region and notifications
\`-raidRegionName\` - disables notifications for that region
\`regions\` - Lists the regions available


`, { split: { maxLength: 1800 } }
    ).then().catch(err => console.error(err))

});

client.on('message', message => {
    if (message.author.bot) { return };
    if (message.channel.id === process.env.sortingHatChannel && message.content) {
        let input = stripHyphenAndWhiteSpace(message.content.toLowerCase())

        if (input === 'regions') {
            message.reply(
                channels.map((channel) => client.channels.get(channel.channelID).name).sort().join("\n"), { split: true }
            )
        }
        /**Easter Egg Stuff */
        else if (responseObject[input]) {
            message.reply(responseObject[message.content]);
        }
        //TODO SortingHat Stuff
        if (input === 'sortme') {
            console.log(`[SortingHat]:\tsortme command for ${message.author.name}[${message.author.id}]`)
            if (houseAssigned(message.member, houses)) {
                message.reply("❌ You're already a member of a house. You cannot change houses.").catch(err => console.error(err));
            } else {
                let house = houses.randomKey();
                message.member.addRole(houses.get(house).role).then(
                    message.reply(`${emoji.houses[house]} Welcome ${message.member} to house ${house}! ${emoji.houses[house]}`).then(
                        client.channels.get(houses.get(house).channel).send(`${emoji.houses[house]}${message.member}, welcome to House ${house}!`).then(
                            console.log(`[SortingHat]:\tPut ${message.author.name}[${message.author.id}] into ${house}`)
                        ).catch(console.error)
                    ).catch(console.error)
                ).catch(console.error)
            }
        };
        if (input.startsWith(process.env.addRole)) {
            let role = input.substr(1);
            let channel = channels.find((channel) => stripHyphenAndWhiteSpace(channel.name) === role)
            console.log(`[SortingHat]:\t${message.author.name}[${message.author.id}] is requesting role ${role}`)
            if (channel.locked) {
                console.log(`[SortingHat]:\t${message.author.name}[${message.author.id}] denied access to ${role} with message:\n${channel.lockedMessage}`)
                message.reply(channel.lockedMessage).catch(console.error)
            } else if (role.startsWith("raid")) {
                if (message.guild.roles.has(role.substr(4))) {
                    message.member.addRoles([channel.accessRoleID, channel.raidRoleID])
                        .then(console.log(`[SortingHat]:\t${message.author.name}[${message.author.id}] granted access to ${role} and ${role.substr(4)}`))
                        .catch(console.error)
                } else {
                    message.reply(`Sorry, I can't find any region that matches with ${role.substr(4)}`)
                }
            } else {
                if (message.guild.roles.has(role)) {
                    message.member.addRole(channel.accessRoleID)
                        .then(console.log(`[SortingHat]:\t${message.author.name}[${message.author.id}] granted access to ${role}`))
                        .catch(console.error)
                } else {
                    message.reply(`Sorry, I can't find any region that matches with ${role}`)
                }
            }
        };
        if (input.startsWith(process.env.removeRole)) {
            if (input.startsWith(process.env.removeRole + "raid")) {

            } else {

            }
        };
        return;
    } else if (message.content) {
        if (message.content.startsWith("!") || message.content.startsWith("?") || message.content.startsWith(".")) return;
        if (channels.has(message.channel.id)) {
            message.channel.send(channels.get(message.channel.id).toString()).then((newMessage) => {
                channels.get(message.channel.id).lastmessage = newMessage;
                channelStorage.set(message.channel.id, channels.get(message.channel.id).toEnmap())
            });
        }
    }

});
client.once('ready', async() => {
    client.user.setActivity('Hhhmmmm. Very interesting...');
    await Promise.all(client.guilds.map(guild => guild.fetchMembers()))
    await channelStorage.defer

    //load the emoji
    houses.keyArray().forEach((house) => {
        emoji.houses[house] = client.guilds.get(process.env.emojiGuild).emojis.find((emoji) => emoji.name === house)
    })
    emoji.houses.ready = true;

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
                    if (role.name == stripHyphenAndWhiteSpace(channel.name)) {
                        // if the channel already has a role matched
                        if (!channels.has(channel.id)) {
                            channels.set(channel.id, new PagerChannel(client, { channelID: channel.id, raidRoleID: role.id }));
                        }
                        console.log(`Adding Role:${guild.roles.get(role.id).name} to ${channel.name}`);
                    }
                });
            }
        });
    });
    console.log('Pager is ready!');
});


client.login(process.env.TESTER);