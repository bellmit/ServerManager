/**
 * ServerManager
 * Copyright (C) 2020-2021 Amir Czwink (amir130@hotmail.de)
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
import { Dictionary, Property, Subject } from "acts-util-core";

import { Injectable } from "../Injector";
import { ChildProcessWithoutNullStreams } from "child_process";
import { Commands } from "srvmgr-api";

export interface ProcessInfo
{
    processId: number;
    commandLine: string;
    exitCode?: number;
    stdOutBuffered: string;
    stdErrBuffered: string;
}

@Injectable
export class ProcessTracker
{
    constructor()
    {
        this.processInfo = {};
        this.processes = {};
        this._processData = new Subject<ProcessInfo>();
        this._processList = new Property<Commands.CommandOverviewData[]>([]);
    }

    //Properties
    public get processData()
    {
        return this._processData;
    }

    public get processList()
    {
        return this._processList;
    }

    //Public methods
    public Get(pid: number)
    {
        return this.processInfo[pid];
    }
    
    public RegisterProcess(process: ChildProcessWithoutNullStreams, commandLine: string)
    {
        const info: ProcessInfo = {
            processId: process.pid,
            commandLine,
            stdOutBuffered: "",
            stdErrBuffered: ""
        };
        this.processInfo[process.pid] = info;
        this.processes[process.pid] = process;
        this.UpdateProcessList();

        process.stdout.on("data", this.OnStdOutDataReceived.bind(this, info));
        process.stderr.on("data", this.OnStdErrDataReceived.bind(this, info));
        process.on("close", this.OnProcessClosed.bind(this, info));
    }

    public WriteInput(pid: number, data: string)
    {
        this.processes[pid]?.stdin.write(data);
    }

    //Private members
    private processInfo: Dictionary<ProcessInfo>;
    private processes: Dictionary<ChildProcessWithoutNullStreams>;
    private _processData: Subject<ProcessInfo>;
    private _processList: Property<Commands.CommandOverviewData[]>;

    //Private methods
    private AddChunkToBuffer(buffer: string, chunk: string)
    {
        const maxCharsPerBufferedStream = 3 * 1024 * 1024; //3 MiB

        let result = buffer + chunk;
        if(result.length > maxCharsPerBufferedStream)
            return result.substr(result.length - maxCharsPerBufferedStream);
        return result;
    }

    private UpdateProcessList()
    {
        const list: Commands.CommandOverviewData[] = [];
        for (const key in this.processInfo)
        {
            if (this.processInfo.hasOwnProperty(key))
            {
                const value = this.processInfo[key]!;

                list.push({ commandline: value.commandLine, pid: value.processId, exitCode: value.exitCode });
            }
        }
        this._processList.Set(list);
    }

    //Event handlers
    private OnProcessClosed(processInfo: ProcessInfo, exitCode: number)
    {
        processInfo.exitCode = exitCode;
        setTimeout(this.OnProcessTimeEnded.bind(this, processInfo), 60 * 1000);

        this._processData.Next(processInfo);
        this.UpdateProcessList();
    }

    private OnProcessTimeEnded(processInfo: ProcessInfo)
    {
        delete this.processInfo[processInfo.processId];

        this.UpdateProcessList();
    }

    private OnStdErrDataReceived(processInfo: ProcessInfo, chunk: string)
    {
        processInfo.stdErrBuffered = this.AddChunkToBuffer(processInfo.stdErrBuffered, chunk);

        this._processData.Next(processInfo);
    }

    private OnStdOutDataReceived(processInfo: ProcessInfo, chunk: string)
    {
        processInfo.stdOutBuffered = this.AddChunkToBuffer(processInfo.stdOutBuffered, chunk);

        this._processData.Next(processInfo);
    }
}