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
    }

    toString() {
        return this.message;
    }

}

module.exports = PagerChannel;