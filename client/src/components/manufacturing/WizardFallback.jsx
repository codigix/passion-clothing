import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Displays a lightweight placeholder while permission checks are resolved or rejected.
 */
const WizardFallback = () => (
  <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-500">
    <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
    <p className="text-sm font-medium">Checking permissions&hellip;</p>
    <p className="text-xs text-gray-400">Please hold on while we verify your access to the production wizard.</p>
  </div>
);

export default WizardFallback;