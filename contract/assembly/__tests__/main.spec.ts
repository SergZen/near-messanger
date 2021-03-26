import {
    sendMessage,
    receiveMessages,
    deleteMessage,
    deleteAllMessages,
    ACCOUNT_MESSAGES_LIMIT,
    MESSAGE_LENGTH_LIMIT
} from '..'

import { VMContext, context } from "near-sdk-as";

/**
 * == CONFIG VALUES ============================================================
 */

const SENDER_ACCOUNT_ID = "SENDER";
const RECEIVER_ACCOUNT_ID = "RECEIVER";

/**
 * == HELPER FUNCTIONS =========================================================
 */
const useSenderAsPredecessor = (): void => {
    VMContext.setPredecessor_account_id(SENDER_ACCOUNT_ID);
};

const useReceiverAsPredecessor = (): void => {
    VMContext.setPredecessor_account_id(RECEIVER_ACCOUNT_ID);
};

describe("sendMessage", () => {
    beforeEach(useSenderAsPredecessor)

    it("error if account empty", () => {
        expect(() => {
            sendMessage("", "text")
        }).toThrow("Account can`t be empty");
    });

    it("error if text empty", () => {
        expect(() => {
            sendMessage(RECEIVER_ACCOUNT_ID, "")
        }).toThrow("Message text can`t be empty");
    });

    it("error if send message to yourself", () => {
        expect(() => {
            sendMessage(context.predecessor, "test")
        }).toThrow("You cant send message to yourself");
    });

    it("error if send too long message", () => {
        expect(() => {
            const text: string = createText(MESSAGE_LENGTH_LIMIT + 1)
            sendMessage(RECEIVER_ACCOUNT_ID, text)
        }).toThrow("The message is too long");
    });

    it("success if send message equal limit", () => {
        const text = createText(MESSAGE_LENGTH_LIMIT)
        sendMessage(RECEIVER_ACCOUNT_ID, text)
    });

    it("error if send message more than message limit", () => {
        for (let i = 0; i < ACCOUNT_MESSAGES_LIMIT; ++i) {
            sendMessage(RECEIVER_ACCOUNT_ID, "text")
        }

        expect(() => {
            sendMessage(RECEIVER_ACCOUNT_ID, "text")
        }).toThrow("Account messages is full");
    });
});

describe("receiveMessages", () => {
    it("check if messages empty", () => {
        useReceiverAsPredecessor()
        const messages = receiveMessages();
        expect(messages.length).toStrictEqual(0)
    });

    it("check if messages equal limit", () => {
        useSenderAsPredecessor()
        for (let i = 0; i < ACCOUNT_MESSAGES_LIMIT; ++i) {
            sendMessage(RECEIVER_ACCOUNT_ID, "text")
        }

        useReceiverAsPredecessor()
        const messages = receiveMessages();
        expect(messages.length).toStrictEqual(ACCOUNT_MESSAGES_LIMIT)
    });
});

describe("deleteMessage", () => {
    it("check if delete with not exist index", () => {
        useSenderAsPredecessor()
        for (let i = 0; i < ACCOUNT_MESSAGES_LIMIT; ++i) {
            sendMessage(RECEIVER_ACCOUNT_ID, "text")
        }

        useReceiverAsPredecessor()
        expect(() => {
            deleteMessage(ACCOUNT_MESSAGES_LIMIT + 2)
        }).toThrow("You are trying delete message with wrong index");

        expect(() => {
            deleteMessage(-1)
        }).toThrow("You are trying delete message with wrong index");
    });

    it("check if delete last message", () => {
        useSenderAsPredecessor()
        for (let i = 0; i < ACCOUNT_MESSAGES_LIMIT; ++i) {
            sendMessage(RECEIVER_ACCOUNT_ID, "text")
        }

        useReceiverAsPredecessor()
        const messages1 = receiveMessages()
        expect(messages1.length).toStrictEqual(ACCOUNT_MESSAGES_LIMIT)

        deleteMessage(0)
        const messages2 = receiveMessages()
        expect(messages2.length).toStrictEqual(ACCOUNT_MESSAGES_LIMIT - 1)
    });
});

describe("deleteAllMessages", () => {
    it("error if try delete empty list", () => {
        useReceiverAsPredecessor()

        expect(() => {
            deleteAllMessages()
        }).toThrow("You are trying delete empty messages");
    });

    it("check if messages equal limit correct remove all messages", () => {
        useSenderAsPredecessor()
        for (let i = 0; i < ACCOUNT_MESSAGES_LIMIT; ++i) {
            sendMessage(RECEIVER_ACCOUNT_ID, "text")
        }

        useReceiverAsPredecessor()
        const messages1 = receiveMessages();
        expect(messages1.length).toStrictEqual(ACCOUNT_MESSAGES_LIMIT)

        deleteAllMessages()
        const messages2 = receiveMessages();
        expect(messages2.length).toStrictEqual(0)
    });
});

function createText(length: i32): string {
    let text = ''
    for (let i = 0; i < length; ++i) {
        text += 'x'
    }
    return text
}
