// ~/vltrn-system/orchestrator/agent-runner.js
import { execa } from 'execa';

/**
 * Runs one of our agent images inside the VLTRN network.
 * agentName must match your docker-compose service name (without the prefix),
 * e.g. "scout-warn" or "marketer-agent".
 */
export async function runAgentContainer(agentName) {
  // Compose project prefix is folder name → images become `vltrn-system_${agentName}`
  const imageName = `vltrn-system_${agentName}:latest`;
  console.log(`[AgentRunner] Starting ${imageName}...`);

  try {
    await execa(
      'docker',
      [
        'run',
        '--rm',
        `--network=vltrn-system_default`,
        '--env-file',
        '.env',
        imageName,
      ],
      { stdio: 'inherit' }
    );
    console.log(`[AgentRunner] ${imageName} completed.`);
    return { success: true };
  } catch (err) {
    console.error(`[AgentRunner] ${imageName} failed:`, err);
    return { success: false, error: err };
  }
}
