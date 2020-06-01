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
import { exec, spawn } from 'child_process';
import { Injectable } from '../Injector';

interface CommandExecutionResult
{
    exitCode: number;
    stdout: string;
    stderr: string;
}

interface CommandOptions
{
    gid: number;
    uid: number;
    workingDirectory?: string;
}

@Injectable
export class CommandExecutor
{
    //Public methods
    public ExecuteAsyncCommand(command: string[], options: CommandOptions)
    {
        const childProcess = spawn(command.join(" "), [], {
            cwd: options.workingDirectory,
            gid: options.gid,
            shell: true,
            uid: options.uid,
        });
        return childProcess;
    }

    public ExecuteCommand(command: string[], options: CommandOptions): Promise<CommandExecutionResult>
    {
        return new Promise<CommandExecutionResult>( (resolve, reject) => {
            exec(command.join(" "), {
                cwd: options.workingDirectory,
                gid: options.gid,
                uid: options.uid,
            }, (error, stdout, stderr) => {
                let exitCode = 0;
                if(error !== null)
                {
                    if(error.code === undefined)
                        reject(error);
                    exitCode = error.code!;
                }
                resolve({ exitCode: exitCode, stdout, stderr});
            });
        });
    }

    public ExecuteWaitableAsyncCommand(command: string[], options: CommandOptions)
    {
        return new Promise<number>( (resolve, reject) => {
            const childProcess = this.ExecuteAsyncCommand(command, options);
            childProcess.on("close", (code, _) => resolve(code));
            childProcess.on("error", reject);
        });
    }
}