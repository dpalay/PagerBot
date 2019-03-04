class PagerChannel {

    /**
     * @param {Discord.Client} client
     * @param {{channelID: string, raidRoleID: string, :accessRoleID: string, message: string, messageID: string, locked: boolean, lockedMessage: string}}
     */


    constructor(client, { channelID = "", raidRoleID = "", accessRoleID = "", message = `New message! $role$`, messageID = "", locked = false, lockedMessage = "" }) {
        this.client = client
        this.channelID = channelID;
        this.accessRoleID = accessRoleID;
        this.raidRoleID = raidRoleID;
        this.message = message.replace("$role$", `<@&${raidRoleID}>`).replace("$channel$", `<#${channelID}>`);
        this.messageID = messageID;
        this.locked = locked;
        this.lockedMessage = lockedMessage;
        this._lastmessage;
        if (messageID) { this.client.channels.get(this.channelID).fetchMessage(this.messageID).then((message) => this.lastmessage = message).catch(err => console.error(err)); }
    }


    toString() {
        return this.message;
    }

    toEnmap() {
        return {
            channelID: this.channelID,
            channelNameTemp: this.client.channels.get(this.channelID).name,
            accessRoleID: this.accessRoleID,
            raidRoleID: this.raidRoleID,
            message: this.message,
            messageID: this.lastmessage.id,
            locked: this.locked,
            lockedMessage: this.lockedMessage
        }
    }

    get lastmessage() {
        return this._lastmessage
    }

    set lastmessage(message) {
        if (this._lastmessage) {
            this._lastmessage.delete().catch(err => console.err(err))
        }
        this._lastmessage = message;
    }

}

module.exports = PagerChannel;