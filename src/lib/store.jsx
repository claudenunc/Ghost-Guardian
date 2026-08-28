// Compatibility entrypoint: the sole application state implementation lives
// in src/app/runtime.jsx. Existing pages may continue importing this module.
export { ApplicationProvider as GuardianProvider, useApplication as useGuardian } from '../app/runtime';
