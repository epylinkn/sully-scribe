// Export all tools and their schemas
import { ToolSchema } from '@/types';

export { 
  setLanguage, 
  setLanguageSchema 
} from './setLanguage';

export {
  processRealtimeMessageSchema
} from './processRealtimeMessage';

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
import { processRealtimeMessageSchema } from './processRealtimeMessage';
import { scheduleFollowupAppointmentSchema } from './ScheduleFollowupAppointment';
import { sendLabOrderSchema } from './SendLabOrder';
import { repeatAudioSchema } from './RepeatAudio';

export const toolSchemas: ToolSchema[] = [
  setLanguageSchema,
  processRealtimeMessageSchema,
  scheduleFollowupAppointmentSchema,
  sendLabOrderSchema,
  repeatAudioSchema
]; 
