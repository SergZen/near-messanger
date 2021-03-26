import { context } from 'near-sdk-as'
import { Message, messagesMap } from './model';

export const ACCOUNT_MESSAGES_LIMIT: i32 = 10
export const MESSAGE_LENGTH_LIMIT: i32 = 100

export function sendMessage(accountTo: string, text: string): void {
  assert(accountTo.length > 0, 'Account can`t be empty')
  assert(text.length > 0, 'Message text can`t be empty')
  assert(context.predecessor != accountTo, "You cant send message to yourself");
  assert(text.length <= MESSAGE_LENGTH_LIMIT, 'The message is too long')

  const messages = messagesMap.get(accountTo, [])!
  assert(messages.length < ACCOUNT_MESSAGES_LIMIT, 'Account messages is full')

  const message = new Message(accountTo, text, context.blockTimestamp)
  messages.push(message)
  messagesMap.set(accountTo, messages)
}

export function receiveMessages(): Message[] {
  return messagesMap.get(context.predecessor, [])!
}

export function deleteMessage(indexId: i32): void {
  const messages = messagesMap.get(context.predecessor, [])!;
  assert(indexId >= 0 && messages.length > indexId, 'You are trying delete message with wrong index')
  const messagesBefore = messages.slice(0, indexId)
  const messagesAfter = messages.slice(indexId + 1)
  const updatedMessages = messagesBefore.concat(messagesAfter)
  messagesMap.set(context.predecessor, updatedMessages)
}

export function deleteAllMessages(): void {
  const messages = messagesMap.get(context.predecessor, [])!
  assert(messages.length > 0, 'You are trying delete empty messages')
  messagesMap.set(context.predecessor, [])
}
