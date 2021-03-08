/**
 * ServerManager
 * Copyright (C) 2021 Amir Czwink (amir130@hotmail.de)
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

import { Component, Injectable, JSX_CreateElement, ProgressSpinner } from "acfrontend";
import { Processes } from "srvmgr-api";
import { ProcessesService } from "./ProcessesService";

@Injectable
export class ProcessListComponent extends Component
{
    constructor(private processesService: ProcessesService)
    {
        super();

        this.delay = 5000;
        this.loading = false;
        this.data = null;
    }
    
    protected Render(): RenderValue
    {
        if(this.data === null)
            return <ProgressSpinner />;

        return <fragment>
            {this.loading ? <ProgressSpinner /> : null}
            <table>
                <tr>
                    <th>Process id</th>
                    <th>Process name</th>
                    <th>Parent process id</th>
                    <th>User id</th>
                    <th>CPU usage</th>
                    <th>Memory usage</th>
                    <th>Command line</th>
                </tr>
                {this.data.OrderBy(x => x.cpuUsage, false).map(this.RenderRow.bind(this))}
            </table>
        </fragment>;
    }

    //Private members
    private loading: boolean;
    private delay: number;
    private timerId?: number;
    private data: Processes.API.QueryProcessesList.ResultData | null;

    //Private methods
    private async QueryNextUsageData()
    {
        this.timerId = undefined;

        this.loading = true;
        this.data = await this.processesService.QueryProcessesList();
        this.loading = false;

        this.timerId = setTimeout(this.QueryNextUsageData.bind(this), this.delay);
    }

    private RenderRow(process: Processes.ProcessInfo)
    {
        return <tr>
            <td>{process.pid}</td>
            <td>{process.name}</td>
            <td>{process.parent_pid}</td>
            <td>{process.uid}</td>
            <td>{process.cpuUsage}</td>
            <td>{(process.memUsageKb * 1024).FormatBinaryPrefixed()}</td>
            <td>{process.commandLine}</td>
        </tr>;
    }

    //Event handlers
    public async OnInitiated()
    {
        this.QueryNextUsageData();
    }

    public OnUnmounted()
    {
        if(this.timerId === undefined)
            clearTimeout(this.timerId);
    }
}