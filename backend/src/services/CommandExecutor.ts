import { exec } from 'child_process';

interface CommandExecutionResult
{
    stdout: string;
    stderr: string;
}

export class CommandExecutor
{
    //Public methods
    ExecuteCommand(command: string): Promise<CommandExecutionResult>
    {
        return new Promise<CommandExecutionResult>( (resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if(error)
                    reject(error);
                resolve({stdout, stderr});
            });
        });
    }
}