// orchestrator/index.js v3.1 - Corrected execa syntax
import { execa } from 'execa'; // Import the main execa function

async function runAgentContainer(agentName) {
  const imageName = `vltrn/${agentName}:1.0.0`;
  console.log(`[VLTRN-Orchestrator] Initiating agent container: ${imageName}`);

  try {
    // CORRECTED: Using the standard, robust execa function call with arguments as an array.
    // This is the proper way to build and execute the command.
    await execa(
      'docker',
      [
        'run',
        '--rm',
        '--network=vltrn-system_default',
        '--env-file',
        '.env',
        imageName
      ],
      { stdio: 'inherit' } // Inherit stdio to see the agent's logs in real-time
    );

    console.log(`[VLTRN-Orchestrator] Agent container ${imageName} finished its mission.`);
  } catch (error) {
    console.error(`[VLTRN-Orchestrator] Agent container ${imageName} failed during execution:`, error);
  }
}

async function main() {
  console.log('[VLTRN-Orchestrator] Starting containerized orchestration workflow...');
  // --- Step 1: Run the WARN notice scraper ---
  await runAgentContainer('scout-warn');
  // --- Step 2: Run the lead enricher ---
  await runAgentContainer('marketer-agent');
  console.log('[VLTRN-Orchestrator] Main orchestration workflow complete.');
}

main();