/**
 * ServerManager
 * Copyright (C) 2019 Amir Czwink (amir130@hotmail.de)
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
    stdout: string;
    stderr: string;
}

@Injectable
export class CommandExecutor
{
    //Public methods
    public ExecuteAsyncCommand(command: string, onStdOutData: (data: string) => void, onStdErrData: (data: string) => void): Promise<number>
    {
        return new Promise<number>( (resolve, reject) => {
            const childProcess = spawn(command, [], {
                shell: true
            });
            childProcess.stdout.on("data", onStdOutData);
            childProcess.stderr.on("data", onStdErrData);

            childProcess.on("close", (code) => resolve(code));
        });
    }

    public ExecuteCommand(command: string): Promise<CommandExecutionResult>
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