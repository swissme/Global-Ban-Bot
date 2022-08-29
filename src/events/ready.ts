import { Event } from "../structures/Event";
import { UserPermission } from '../entities/UserPermission';

export default new Event('ready', async () => {
    console.log('Bot is online!');

    let mainDiscordUser = await UserPermission.findOne({ where: { userID: process.env.mainDiscordID }});
    if(mainDiscordUser) return;
    mainDiscordUser = await UserPermission.create({
        userID: process.env.mainDiscordID
    });
    mainDiscordUser.save();
});