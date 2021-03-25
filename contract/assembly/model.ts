import { PersistentMap } from "near-sdk-as";

@nearBindgen
export class Message {
    constructor(
        public accountTo: string,
        public text: string,
        public timestamp: u64
    ) {}
}

export const messagesMap = new PersistentMap<string, Message[]>("m");
