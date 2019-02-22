class PagerChannel {

    /**
     * 
     * @param {string} channelID ID for the channel in discord
     * @param {string} roleID associated role
     * @param {string} message Message to display.  use $role$ to represent role id and $channel$ to represent channel id
     */
    constructor({ channelID = "", roleID = "", message = `New message! <@&$role$>` }) {

        this.channelID = channelID;
        this.roleID = roleID;
        this.message = message.replace("$role$", roleID).replace("$channel$", channelID);
        this._lastmessage;
    }

    toString() {
        return this.message;
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