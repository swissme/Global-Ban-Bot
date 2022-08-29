import { Command } from "../structures/Command"
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { UserPermission } from '../entities/UserPermission';

export default new Command ({
    name: "removeperms",
    description: "Removes permissions from a user",
    options: [
        {
            name: "user",
            description: "The user to remove permissions from",
            required: true,
            type: ApplicationCommandOptionType.User
        },
    ],
    run: async ({ interaction }) => {
        if(interaction.member.id !== process.env.mainDiscordID) return interaction.editReply("You do not have the permissions to do this action");
        let target = interaction.options.get("user")!.value as string;
        let user = await UserPermission.findOne({ where: { userID: target }});
        if(!user) return interaction.editReply("That user doesn't have permissions");
        await UserPermission.delete({
            userID: target
        });
        let targetUser = await interaction.client.users.fetch(target);
        const embed = new EmbedBuilder()
            // .setColor(process.env.color)
            .setTitle("User Permissions Removed")
            .setAuthor({
                name: targetUser.tag,
                iconURL: targetUser.displayAvatarURL()
            })
            .setDescription(`<@${target}> has been revoked from their permissions`);
        interaction.editReply({ embeds: [embed] });
    }
});