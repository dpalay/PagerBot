class PagerChannel {

    /**
     * 
     * @param {string} channelID ID for the channel in discord
     * @param {string} roleID associated role
     * @param {string} message Message to display.  use $role$ to represent role id and $channel$ to represent channel id
     */
    constructor(client, { channelID = "", roleID = "", message = `New message! $role$`, messageID = "" }) {

        this.client = client
        this.channelID = channelID;
        this.roleID = roleID;
        this.message = message.replace("$role$", `<@&${roleID}>`).replace("$channel$", `<#${channelID}>`);
        this.messageID = messageID;
        this._lastmessage;
        if (messageID) { this.client.channels.cache.get(this.channelID).messages.fetch(this.messageID).then((message) => this.lastmessage = message).catch(err => console.error(err)); }
    }


    toString() {
        return this.message;
    }

    toEnmap() {
        return { channelID: this.channelID, roleID: this.roleID, message: this.message, messageID: this.lastmessage.id }
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