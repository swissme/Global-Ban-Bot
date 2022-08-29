import { ApplicationCommandOptionType, ColorResolvable, EmbedBuilder } from "discord.js";
import { Ban } from "../entities/Ban";
import { UserPermission } from "../entities/UserPermission";
import { Command } from "../structures/Command";

export default new Command({
    name: "lookup",
    description: "Looks up a user for their ban",
    options: [
        {
            name: "victim",
            description: "The user to lookup",
            required: true,
            type: ApplicationCommandOptionType.String
        }
    ],
    run: async({ interaction }) => {
        let userPermissions = await UserPermission.findOne({ where: { userID: interaction.member.id }});
        if(!userPermissions) return interaction.editReply("You do not have the permissions to do this action");
        let victim = interaction.options.get("victim")!.value as string;
        let ban = await Ban.findOne({ where: { victim: victim }});
        if(!ban) return interaction.editReply("That user is not globally banned");
        let issuer = await interaction.client.users.fetch(ban.issuer);
        let reason = ban.reason;
        let victimUser = await interaction.client.users.fetch(victim);
        const embed = new EmbedBuilder()
            .setColor(process.env.)
            .setAuthor({
                name: victimUser.tag,
                iconURL: victimUser.displayAvatarURL()
            })
            .addFields([
                {
                    name: "Issuer",
                    value: `<@${issuer.id}>`,
                },
                {
                    name: "Victim",
                    value: `<@${victim}>`,
                },
                {
                    name: "Reason",
                    value: reason,
                },
                {
                    name: "Timestamp",
                    value: ban.createdAt.toLocaleString(),
                }
            ])
            .setTitle("Global Ban Lookup");

        interaction.editReply({ embeds: [embed]});
    }

});