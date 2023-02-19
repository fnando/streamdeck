import childProcess from "child_process";
import { die } from "./die";

export function exec(
  command: string,
  args: string[],
  {
    error,
    cwd,
    exitOnError = true,
  }: { error: string; cwd: string; exitOnError?: boolean },
) {
  const result = childProcess.spawnSync(command, args, { cwd });

  if (result.status !== 0) {
    return exitOnError ? die(error) : null;
  }

  return result;
}
