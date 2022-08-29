declare namespace NodeJS {
    export interface ProcessEnv {
        botToken: string;
        enviroment: "dev" | "prod" | "debug";
        database: string;
        uri: string;
        color: string;
        mainDiscordID: string;
   }
}

export {};