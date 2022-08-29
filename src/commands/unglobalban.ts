import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, CollectorFilter, EmbedBuilder, Interaction } from "discord.js";
import { Ban } from "../entities/Ban";
import { Command } from "../structures/Command";

export default new Command({
    name: "unglobalban",
    description: "Unbans the user in all of the servers",
    options: [
        {
            name: "victim",
            description: "The user to unban",
            required: true,
            type: ApplicationCommandOptionType.String
        }
    ],
    run: async({ interaction }) => {
        let victim = interaction.options.get("victim")!.value as string;
        let ban = await Ban.findOne({ where: { victim }});
        if(!ban) return interaction.editReply("That user is not globally banned");
        let victimUser = await interaction.client.users.fetch(victim);
        const embed = new EmbedBuilder()
            // .setColor(process.env.color)
            .setAuthor({
                name: victimUser.tag,
                iconURL: victimUser.displayAvatarURL()
            })
            .setDescription("Are you sure you want to unban <@" + victim + "> from all servers");

        const acceptButton = new ButtonBuilder();
        acceptButton.setStyle(ButtonStyle.Success);
        acceptButton.setLabel("Accept");
        acceptButton.setCustomId(`accept-unban-${victim}`);
        
        const declineButton = new ButtonBuilder();
        declineButton.setStyle(ButtonStyle.Danger);
        declineButton.setLabel("Decline");
        declineButton.setCustomId(`decline-unban-${victim}`);

        await interaction.editReply({
            embeds: [embed],
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        acceptButton,
                        declineButton
                    )
            ],
        });

        const acceptFilter = (i: any) => i.customId === `accept-unban-${victim}` && i.user.id === interaction.member.id;

        const acceptCollector = interaction.channel!.createMessageComponentCollector({ filter: acceptFilter, time: 15000 });

        acceptCollector.on('collect', async i => {
            await ban!.remove();
            const newEmbed = new EmbedBuilder()
                .setAuthor({
                    name: victimUser.tag,
                    iconURL: victimUser.displayAvatarURL()
                })
                .setTitle("Global Ban")
                .setDescription(`<@${victimUser.id}> has been globally unbanned from **${interaction.client.guilds.cache.size}** servers`)
            await i.update({ components: [], embeds: [ newEmbed ] })
        });

        const declineFilter = (i: any) => i.customId === `decline-unban-${victim}` && i.user.id === interaction.member.id;

        const declineCollector = interaction.channel!.createMessageComponentCollector({ filter: declineFilter, time: 15000 });

        declineCollector.on('collect', async i => {
            const newEmbed = new EmbedBuilder()
                .setAuthor({
                    name: victimUser.tag,
                    iconURL: victimUser.displayAvatarURL()
                })
                .setTitle("Global Ban")
                .setDescription(`You declined <@${victimUser.id}>'s global unban`)
            await i.update({ components: [], embeds: [ newEmbed ] })
        });
    }
});
