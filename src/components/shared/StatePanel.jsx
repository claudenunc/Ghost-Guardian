import React from 'react';

const labels = {
  loading: 'Loading',
  empty: 'Nothing here yet',
  error: 'Something went wrong',
  offline: 'You appear to be offline',
  unavailable: 'This service is not available',
  permission: 'You do not have permission for this action',
  success: 'Complete',
};

/** Reusable baseline for page loading, empty, error, offline, and access states. */
export function StatePanel({ state = 'empty', title, children, action }) {
  return (
    <section className={`app-state app-state-${state}`} aria-live={state === 'loading' ? 'polite' : undefined}>
      <h2>{title || labels[state] || labels.empty}</h2>
      {children ? <p>{children}</p> : null}
      {action}
    </section>
  );
}

