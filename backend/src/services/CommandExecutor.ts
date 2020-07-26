/**
 * ServerManager
 * Copyright (C) 2019-2020 Amir Czwink (amir130@hotmail.de)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * */
import { exec, spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { Injectable } from '../Injector';
import { ProcessTracker } from './ProcessTracker';

interface CommandExecutionResult
{
    exitCode: number;
    stdout: string;
    stderr: string;
}

export interface CommandOptions
{
    gid: number;
    uid: number;
    workingDirectory?: string;
}

@Injectable
export class CommandExecutor
{
    constructor(private processTracker: ProcessTracker)
    {
    }

    //Public methods
    public ChildProcessToPromise(childProcess: ChildProcessWithoutNullStreams)
    {
        return new Promise<number>( (resolve, reject) => {
            childProcess.on("close", (code, _) => resolve(code));
            childProcess.on("error", reject);
        });
    }

    public CreateChildProcess(command: string[], options: CommandOptions)
    {
        const commandLine = command.join(" ");
        const childProcess = spawn(commandLine, [], {
            cwd: options.workingDirectory,
            gid: options.gid,
            shell: true,
            uid: options.uid,
        });

        this.processTracker.RegisterProcess(childProcess, commandLine);

        return childProcess;
    }

    public async ExecuteCommand(command: string[], options: CommandOptions, expectedExitCode: number = 0)
    {
        const result = await this.ExecuteCommandWithExitCode(command, options);
        if(result.exitCode !== expectedExitCode)
            throw new Error("Command '" + command.join(" ") + "' failed. stderr: " + result.stderr);

        return result;
    }

    public async ExecuteCommandWithExitCode(command: string[], options: CommandOptions): Promise<CommandExecutionResult>
    {
        const childProcess = this.CreateChildProcess(command, options);

        let stdOut = "";
        childProcess.stdout.on("data", chunk => stdOut += chunk);

        let stdErr = "";
        childProcess.stderr.on("data", chunk => stdErr += chunk);

        const exitCode = await this.ChildProcessToPromise(childProcess);

        return { exitCode, stderr: stdErr, stdout: stdOut };
    }

    public async ExecuteCommandExitCodeOnly(command: string[], options: CommandOptions): Promise<number>
    {
        return (await this.ExecuteCommandWithExitCode(command, options)).exitCode;
    }
}