// orchestrator/index.js v3.0 - Docker-in-Docker Orchestration
import { $ } from 'execa';

async function runAgentContainer(agentName) {
  const imageName = `vltrn/${agentName}:1.0.0`;
  console.log(`[VLTRN-Orchestrator] Initiating agent container: ${imageName}`);
  
  try {
    // The --env-file flag points to a file *on the host machine*.
    // Since we are running in a container, we must use absolute paths
    // or run the docker command from the project root on the host.
    // For this test, we assume the .env file is in the current working directory
    // from where the 'docker compose up' command is run.
    // A more advanced setup would use Kubernetes secrets.
    
    // We execute the 'docker run' command.
    const agentProcess = $({ stdio: 'inherit' })`docker run --rm --network="vltrn-system_default" --env-file .env ${imageName}`;
    
    await agentProcess;
    
    console.log(`[VLTRN-Orchestrator] Agent container ${imageName} finished its mission.`);
  } catch (error) {
    console.error(`[VLTRN-Orchestrator] Agent container ${imageName} failed during execution.`);
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