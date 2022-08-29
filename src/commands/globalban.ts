import { Command } from './../structures/Command';
import { client } from '..';
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from 'discord.js';
import { Ban } from './../entities/Ban';
import { UserPermission } from './../entities/UserPermission';

export default new Command({
    name: 'globalban',
    description: 'Bans the user in all of the servers',
    options: [
        {
            name: "victim",
            description: "The user to ban",
            required: true,
            type: ApplicationCommandOptionType.User
        },
        {
            name: "reason",
            description: "The reason for the ban",
            required: true,
            type: ApplicationCommandOptionType.String
        }
    ],
    run: async({ interaction }) => {
        let userPermissions = await UserPermission.findOne({ where: { userID: interaction.member.id }});
        if(!userPermissions) return interaction.editReply("You do not have the permissions to do this action");
        let victim = interaction.options.get("victim")!.user!;
        if(victim.id === interaction.member.id) return interaction.editReply("You cannot ban yourself");
        if(interaction.client.user!.id === victim.id) return interaction.editReply("You cannot ban the bot");
        let victimPermissions = await UserPermission.findOne({ where: { userID: victim.id }});
        if(victimPermissions) return interaction.editReply("You cannot ban that user");
        let ban = await Ban.findOne({ where: { victim: victim.id }});
        if(ban) return interaction.editReply("That user is already globally banned");
        let reason = interaction.options.get("reason")!.value as string;
        const embed = new EmbedBuilder()
            // .setColor(process.env.color)
            .setAuthor({
                name: victim.tag,
                iconURL: victim.displayAvatarURL()
            })
            .addFields([
                {
                    name: "Issuer",
                    value: `<@${interaction.member.id}>`,
                },
                {
                    name: "Victim",
                    value: `<@${victim.id}>`,
                },
                {
                    name: "Reason",
                    value: reason,
                }
            ])
            .setTitle("Global Ban");

        const acceptButton = new ButtonBuilder();
        acceptButton.setStyle(ButtonStyle.Success);
        acceptButton.setLabel("Accept");
        acceptButton.setCustomId(`accept-ban-${victim.id}`);
        
        const declineButton = new ButtonBuilder();
        declineButton.setStyle(ButtonStyle.Danger);
        declineButton.setLabel("Decline");
        declineButton.setCustomId(`decline-ban-${victim.id}`);

        await interaction.editReply({
            embeds: [embed],
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        acceptButton,
                        declineButton
                    )
            ],
        })

        const acceptFilter = (i: any) => i.customId === `accept-ban-${victim.id}` && i.user.id === interaction.member.id;

        const acceptCollector = interaction.channel!.createMessageComponentCollector({ filter: acceptFilter, time: 15000 });

        acceptCollector.on('collect', async i => {
            const guilds = client.guilds.cache;
            guilds.forEach((guild) => {
                const members = guild.members;
                if(!members.cache.has(victim.id)) return;
                members.ban(victim, { reason: reason });
            });
            ban = await Ban.create({
                victim: victim.id,
                issuer: interaction.member.id,
                reason: reason,
                createdAt: new Date()
            });
            ban.save();
            const newEmbed = new EmbedBuilder()
                .setAuthor({
                    name: victim.tag,
                    iconURL: victim.displayAvatarURL()
                })
                .setTitle("Global Ban")
                .setDescription(`<@${victim.id}> has been globally banned from **${guilds.size}** servers`)
            await i.update({ components: [], embeds: [ newEmbed ] })
        });

        const declineFilter = (i: any) => i.customId === `decline-ban-${victim.id}` && i.user.id === interaction.member.id;

        const declineCollector = interaction.channel!.createMessageComponentCollector({ filter: declineFilter, time: 15000 });

        declineCollector.on('collect', async i => {
            const newEmbed = new EmbedBuilder()
                .setAuthor({
                    name: victim.tag,
                    iconURL: victim.displayAvatarURL()
                })
                .setTitle("Global Ban")
                .setDescription(`You declined <@${victim.id}>'s global ban`)
            await i.update({ components: [], embeds: [ newEmbed ] })
        });

    }
});
