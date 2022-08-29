import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection } from "discord.js";
import { CommandType } from "../types/Command";
import { promisify } from "util";
import { Event } from './Event';
import { RegisterCommandsOptions } from "../types/client";
import { createDbConnection } from "../data-source";
import glob from "glob";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const globPromise = promisify(glob);

export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();

    constructor() {
        super({ intents: 32767 });
    }

    async start() {
        await createDbConnection();

        this.registerModules();
        this.login(process.env.botToken);
    }

    async importFile(filePath: string) {
        return (await import(filePath))?.default;
    }

    async registerCommands({ commands }: RegisterCommandsOptions) {
        for(const guild of this.guilds.cache.values()) {
            guild.commands.set(commands);
        }
        console.log('Registering commands globally');
    }

    async registerModules() {
        // Slash Commands
        const slashCommands: ApplicationCommandDataResolvable[] = [];
        const commandFiles = await globPromise(`*{.ts,.js}`, {cwd: __dirname + "/../commands/"});
        for(const file of commandFiles) {
            const command: CommandType = await this.importFile(
                `../commands/${file}`
            );
            if(!command.name) return;

            this.commands.set(command.name, command);
            slashCommands.push(command);
        }

        this.on("ready", () => {
            this.registerCommands({ commands: slashCommands });
        });

        // Event
        const eventFiles = await globPromise(`*{.ts,.js}`, {cwd: __dirname + '/../events/'});
        eventFiles.forEach(async (filePath: any) => {
            const event: Event<keyof ClientEvents> = await this.importFile(
                `../events/${filePath}`

            );
            this.on(event.event, event.run);
        });

    }

    async getColor() {
        process.env.
    }

}