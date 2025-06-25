// orchestrator/index.js
// This script is the central brain for running VLTRN agents.

// We use the 'execa' library to run shell commands and agent scripts.
// The {$} syntax is a convenient shorthand provided by execa.
import { $ } from 'execa';

/**
 * Executes a VLTRN agent script located in the ../agents/ directory.
 * @param {string} agentName - The name of the agent directory (e.g., 'scout-warn').
 */
async function runAgent(agentName) {
  console.log(`[VLTRN-Orchestrator] Initiating agent: ${agentName}`);
  
  const agentPath = `../agents/${agentName}`;
  
  try {
    // We create a child process that navigates into the agent's directory
    // and executes its start command ('node index.js').
    // The 'stdio: "inherit"' option streams the agent's output (stdout, stderr)
    // directly to the orchestrator's console in real-time.
    const agentProcess = $({ stdio: 'inherit' })`cd ${agentPath} && node index.js`;
    
    // We wait for the agent's process to complete.
    await agentProcess;
    
    console.log(`[VLTRN-Orchestrator] Agent ${agentName} finished its mission.`);
  } catch (error) {
    console.error(`[VLTRN-Orchestrator] Agent ${agentName} failed during execution.`);
    // The error from the agent will have already been printed due to stdio: 'inherit'.
  }
}

/**
 * The main orchestration workflow.
 */
async function main() {
  console.log('[VLTRN-Orchestrator] Starting main workflow...');
  
  // --- Step 1: Run the WARN notice scraper ---
  await runAgent('scout-warn');
  
  // --- Step 2: Run the lead enricher (placeholder for future logic) ---
   await runAgent('marketer-agent');

  console.log('[VLTRN-Orchestrator] Main workflow complete.');
}

// Execute the main workflow.
main();