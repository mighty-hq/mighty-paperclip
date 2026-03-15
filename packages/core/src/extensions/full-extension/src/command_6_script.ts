import { showHUD, Clipboard } from '@mighty/api';

export default async function main() {
  console.log('command_6_script');
  const now = new Date();
  await Clipboard.copy(now.toLocaleDateString());
  await showHUD('Copied date to clipboard');
}
