import type { Question } from '@/types';
import { earthRotationQuestions } from './earth-rotation';
import { timezoneQuestions } from './timezone';
import { solarDeclinationQuestions } from './solar-declination';
import { dayNightLengthQuestions } from './day-night-length';
import { solarAltitudeQuestions } from './solar-altitude';
import { seasonsZonesQuestions } from './seasons-zones';
import { obliquityQuestions } from './obliquity';
import { terminatorQuestions } from './terminator';
import { comprehensiveQuestions } from './comprehensive';

export const allQuestions: Question[] = [
  ...earthRotationQuestions,
  ...timezoneQuestions,
  ...solarDeclinationQuestions,
  ...dayNightLengthQuestions,
  ...solarAltitudeQuestions,
  ...seasonsZonesQuestions,
  ...obliquityQuestions,
  ...terminatorQuestions,
  ...comprehensiveQuestions,
];

export {
  earthRotationQuestions,
  timezoneQuestions,
  solarDeclinationQuestions,
  dayNightLengthQuestions,
  solarAltitudeQuestions,
  seasonsZonesQuestions,
  obliquityQuestions,
  terminatorQuestions,
  comprehensiveQuestions,
};