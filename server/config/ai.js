import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({
  apiKey: process.env.AI_API_KEY,
});

export const AI_MODEL = process.env.AI_MODEL || 'mixtral-8x7b-32768';
export const SUPPORTED_INTENTS = [ 
  'TIMELINE',
  'LAB_RESULTS',
  'MEDICATION_EVENTS',
  'PROCEDURES',
  'TRANSFERS',
  'DIAGNOSES',
  'ICU_OBSERVATIONS',
  'SOURCE_LOOKUP' ];

export default groq;