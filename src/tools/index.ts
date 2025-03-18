// Export all tools and their schemas
import { ToolSchema } from '@/types';

export { 
  setLanguage, 
  setLanguageSchema 
} from './setLanguage';

export {
  processMessageTranslationSchema
} from './processMessageTranslation';

export {
  scheduleFollowupAppointment,
  scheduleFollowupAppointmentSchema
} from './ScheduleFollowupAppointment';

export {
  sendLabOrder,
  sendLabOrderSchema
} from './SendLabOrder';

export {
  repeatAudio,
  repeatAudioSchema
} from './RepeatAudio';

// Export all schemas as a collection for easy access
import { setLanguageSchema } from './setLanguage';
import { processMessageTranslationSchema } from './processMessageTranslation';
import { scheduleFollowupAppointmentSchema } from './ScheduleFollowupAppointment';
import { sendLabOrderSchema } from './SendLabOrder';
import { repeatAudioSchema } from './RepeatAudio';

export const toolSchemas: ToolSchema[] = [
  setLanguageSchema,
  processMessageTranslationSchema,
  scheduleFollowupAppointmentSchema,
  sendLabOrderSchema,
  repeatAudioSchema
]; 
