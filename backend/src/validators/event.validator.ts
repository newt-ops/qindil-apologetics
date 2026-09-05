import { z } from 'zod';

export const createEventSchema = z
  .object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(2, 'Title must be at least 2 characters long'),
    description: z.string().optional(),
    startDate: z
      .string({ required_error: 'Start date is required' })
      .min(1, 'Start date is required'),
    endDate: z.string().optional(),
    allDay: z.boolean().optional().default(true),
    type: z.enum(['deadline', 'meeting', 'publicEvent', 'other'], {
      required_error: 'Event type is required',
      invalid_type_error: 'Type must be deadline, meeting, publicEvent, or other',
    }),
    visibility: z.enum(['public', 'team'], {
      required_error: 'Visibility is required',
      invalid_type_error: 'Visibility must be public or team',
    }),
    location: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate) {
        return new Date(data.endDate).getTime() >= new Date(data.startDate).getTime();
      }
      return true;
    },
    {
      message: 'End date must be greater than or equal to start date',
      path: ['endDate'],
    }
  );

export const updateEventSchema = z
  .object({
    title: z.string().min(2, 'Title must be at least 2 characters long').optional(),
    description: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    allDay: z.boolean().optional(),
    type: z.enum(['deadline', 'meeting', 'publicEvent', 'other']).optional(),
    visibility: z.enum(['public', 'team']).optional(),
    location: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate) {
        return new Date(data.endDate).getTime() >= new Date(data.startDate).getTime();
      }
      return true;
    },
    {
      message: 'End date must be greater than or equal to start date',
      path: ['endDate'],
    }
  );

export type CreateEventPayload = z.infer<typeof createEventSchema>;
export type UpdateEventPayload = z.infer<typeof updateEventSchema>;
