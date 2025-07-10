import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function runAgentContainer(agentName, prompt) {
  console.log(`[Orchestrator] Attempting to launch agent service: ${agentName}`);
  
  // This command correctly starts the agent as a managed service on the shared network.
  const command = `docker compose up -d ${agentName}`;

  try {
    const { stdout, stderr } = await execPromise(command);
    if (stderr) {
      console.warn(`[Orchestrator] Stderr during ${agentName} launch:`, stderr);
    }
    console.log(`[Orchestrator] Command for ${agentName} executed successfully.`, stdout);
    return { success: true, message: `Agent ${agentName} launched.` };
  } catch (error) {
    console.error(`[Orchestrator] FATAL: Failed to launch agent ${agentName}.`, error);
    return { success: false, message: error.message };
  }
}