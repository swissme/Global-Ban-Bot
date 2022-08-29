import { Command } from "../structures/Command"
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { UserPermission } from '../entities/UserPermission';

export default new Command ({
    name: "addperms",
    description: "Adds permissions to a user",
    options: [
        {
            name: "user",
            description: "The user to add permissions to",
            required: true,
            type: ApplicationCommandOptionType.User
        },
    ],
    run: async ({ interaction }) => {
        if(interaction.member.id !== process.env.mainDiscordID) return interaction.editReply("You do not have the permissions to do this action");
        let target = interaction.options.get("user")!.value as string;
        let user = await UserPermission.findOne({ where: { userID: target }});
        if(user) return interaction.editReply("That user already has permissions");
        user = await UserPermission.create({
            userID: target
        });
        user.save();
        let targetUser = await interaction.client.users.fetch(target);
        const embed = new EmbedBuilder()
            // .setColor(process.env.color)
            .setTitle("User Permissions Added")
            .setAuthor({
                name: targetUser.tag,
                iconURL: targetUser.displayAvatarURL()
            })
            .setDescription(`<@${target}> has been given permissions`);
        interaction.editReply({ embeds: [embed] });
    }
});