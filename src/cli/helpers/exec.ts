import childProcess from "child_process";
import { die } from "./die";

export function exec(
  command: string,
  args: string[],
  { error, cwd }: { error: string; cwd: string },
) {
  const result = childProcess.spawnSync(command, args, { cwd });

  if (result.status !== 0) {
    die(error);
  }

  return result;
}
