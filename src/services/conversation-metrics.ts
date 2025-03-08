import { Message } from '@/types';

/**
 * Calculates various metrics from a conversation thread
 */
export interface ConversationMetrics {
  totalMessages: number;
  chatDuration: string;
  averageTimeBetweenMessages: string;
}

/**
 * Calculates conversation metrics from an array of messages
 * @param messages Array of message objects with timestamps
 * @returns Calculated metrics including message count, duration and average response time
 */
export function calculateConversationMetrics(messages: Message[]): ConversationMetrics {
  const totalMessages = messages.length;
  let chatDuration = '-';
  let averageTimeBetweenMessages = '-';
  
  // Default return for empty or single message conversations
  if (messages.length < 2) {
    return {
      totalMessages,
      chatDuration,
      averageTimeBetweenMessages
    };
  }
  
  // Extract timestamps from first and last messages
  const firstMessage = messages[0].createdAt instanceof Date ? messages[0].createdAt.getTime() : 0;
  const lastMessage = messages[messages.length - 1].createdAt instanceof Date ?
    messages[messages.length - 1].createdAt?.getTime() : 0;

  // Calculate duration metrics only if we have valid timestamps
  if (firstMessage && lastMessage) {
    const durationMs = lastMessage - firstMessage;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    
    // Format the duration string
    chatDuration = `${minutes}m ${seconds}s`;
    
    // Calculate average time between messages
    const totalSeconds = minutes * 60 + seconds;
    const avgSeconds = Math.round(totalSeconds / (totalMessages - 1));
    averageTimeBetweenMessages = `${avgSeconds}s`;
  }

  return {
    totalMessages,
    chatDuration,
    averageTimeBetweenMessages
  };
} 
