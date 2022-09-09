# PagerBot

PagerBot pings a role when a message is sent in a channel, and deletes its previous message.

## Installation

Tested using node `18.7.0` and npm `8.15.0`.

`npm install` should install:
 - `discord.js@14.3.0`
 - `dotenv@16.0.2`
 - `enmap@5.9.1`

## Usage

 - `cp .env.example .env` and add your Discord bot token.
 - `cp AdditionalChanToRole.js.example AdditionalChanToRole.js` and set channels/roles/messages.
 - `node Pajer.js` to run