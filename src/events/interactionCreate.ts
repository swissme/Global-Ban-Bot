import { client } from "..";
import { Event } from "../structures/Event";
import { CommandInteractionOptionResolver } from 'discord.js';
import { ExtendedInteraction } from "../types/Command";

export default new Event('interactionCreate', async (interaction) => {
    // Chat Input Commands
    if(interaction.isCommand()) {
        await interaction.deferReply();
        const command = client.commands.get(interaction.commandName);
        if(!command) return interaction.followUp('You have not entered a valid command');

        command.run({
            args: interaction.options as CommandInteractionOptionResolver,
            client,
            interaction: interaction as ExtendedInteraction
        })
    }
});