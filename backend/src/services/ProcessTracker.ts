/**
 * ServerManager
 * Copyright (C) 2020 Amir Czwink (amir130@hotmail.de)
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
import { Dictionary } from "acts-util";

import { Injectable } from "../Injector";
import { CommandExecutor } from "./CommandExecutor";
import { ChildProcessWithoutNullStreams } from "child_process";
import { ApiSessionInfo } from "../Api";

interface ProcessInfo
{
    process: ChildProcessWithoutNullStreams;
    exitCode?: number;
    stdOutBuffered: string;
    stdErrBuffered: string;
}

@Injectable
export class ProcessTracker
{
    constructor(private commandExecutor: CommandExecutor)
    {
        this.processInfo = {};
    }

    //Public methods
    public CreateProcessByCommand(command: string, session: ApiSessionInfo)
    {
        const process = this.commandExecutor.ExecuteAsyncCommand(command, session);
        const info: ProcessInfo = {
            process,
            stdOutBuffered: "",
            stdErrBuffered: ""
        }
        this.processInfo[process.pid] = info;

        process.stdout.on("data", this.OnStdOutDataReceived.bind(this, info));
        process.stderr.on("data", this.OnStdErrDataReceived.bind(this, info));
        process.on("close", this.OnProcessClosed.bind(this, info));

        return process.pid;
    }

    //Private members
    private processInfo: Dictionary<ProcessInfo>;

    //Event handlers
    private OnProcessClosed(processInfo: ProcessInfo, exitCode: number)
    {
        processInfo.exitCode = exitCode;
        setTimeout(this.OnProcessTimeEnded.bind(this, processInfo), 60 * 1000);
    }

    private OnProcessTimeEnded(processInfo: ProcessInfo)
    {
        delete this.processInfo[processInfo.process.pid];
    }

    private OnStdErrDataReceived(processInfo: ProcessInfo, chunk: string)
    {
        processInfo.stdErrBuffered += chunk;
    }

    private OnStdOutDataReceived(processInfo: ProcessInfo, chunk: string)
    {
        processInfo.stdOutBuffered += chunk;
    }
}