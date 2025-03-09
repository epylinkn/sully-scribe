// Export all tools and their schemas
export { 
  setLanguage, 
  setLanguageSchema 
} from './setLanguage';

export { 
  addMessageSchema 
} from './addMessage';

// Export all schemas as a collection for easy access
import { setLanguageSchema } from './setLanguage';
import { addMessageSchema } from './addMessage';

export const toolSchemas = [
  setLanguageSchema,
  addMessageSchema
]; 
