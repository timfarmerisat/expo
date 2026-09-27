import { categories, innovations } from './catalog.js';

/** Deterministic, browser-safe guidance over the local workspace state. */
export function generateLocalReply(rawText, { assetCount = 0, openTaskCount = 0, healthReady = false } = {}) {
  const lower = String(rawText ?? '').trim().toLowerCase();
  let text;
  let source;
  if (/attention|block|risk|issue|missing|need to do/.test(lower)) {
    text = `There are no remote provider connections configured, so Drive, Microsoft, Dropbox, GitHub, the hosted model gateway, and device pairing are unavailable to this app. The local interface is installed: ${innovations.length} of ${innovations.length} catalog entries are present, and ${openTaskCount} local task${openTaskCount === 1 ? '' : 's'} are open. Review Connections to see the setup path, or add a local task to track a next step.`;
    source = 'Connection directory, feature registry, and local tasks';
  } else if (/innovation|feature|upgrade|77|registry/.test(lower)) {
    text = `The innovation registry contains ${innovations.length} front-end capabilities across ${categories.length} departments, and all ${innovations.length} are included in this build. They cover command visibility, local assistant guidance, browser-local assets, provider readiness, tasks, reliability, and accessibility. This count describes the installed interface; it does not mean remote providers or a hosted AI model are connected.`;
    source = 'Installed innovation registry';
  } else if (/asset|file|upload|document/.test(lower)) {
    text = `There ${assetCount === 1 ? 'is' : 'are'} ${assetCount} active file${assetCount === 1 ? '' : 's'} in this browser's local asset vault. New files stay in IndexedDB on this device, get a SHA-256 fingerprint, and are not uploaded. You can move a file to recoverable trash and export its registry metadata.`;
    source = 'Browser-local asset vault';
  } else if (/connection|provider|drive|microsoft|dropbox|github|bluetooth|wi-fi|wifi|model/.test(lower)) {
    text = 'The provider directory is installed, but this app has no external provider authorization. Each card explains the secure setup boundary. Add OAuth and model credentials only in a protected backend or signed native bridge; this browser UI does not collect them.';
    source = 'Connection readiness directory';
  } else if (/task|activity|next step|organize/.test(lower)) {
    text = `There ${openTaskCount === 1 ? 'is' : 'are'} ${openTaskCount} open local task${openTaskCount === 1 ? '' : 's'}. You can create, prioritize, complete, search, and export tasks in Activity. These records stay in this browser profile until you export a backup.`;
    source = 'Local task board';
  } else if (/status|health|system|summary|online/.test(lower)) {
    text = `The local command interface is ${healthReady ? 'responding' : 'not currently reachable'} at its health endpoint. The ${innovations.length} front-end capabilities are present. External providers are not connected, the hosted model is not configured, and Bluetooth/Wi-Fi device state is not available to a normal browser. ${assetCount} asset${assetCount === 1 ? '' : 's'} and ${openTaskCount} open task${openTaskCount === 1 ? '' : 's'} are in this browser.`;
    source = 'Local health endpoint and browser state';
  } else {
    text = `I can help with the ${innovations.length} installed interface innovations, local assets, local tasks, activity, or provider setup. I use simple on-device routing rules in this build, so I do not have a connected language model or access to accounts beyond this browser. Try “Show innovation status” or “What needs attention?”`;
    source = 'Local guided assistant';
  }
  return { text, source };
}
