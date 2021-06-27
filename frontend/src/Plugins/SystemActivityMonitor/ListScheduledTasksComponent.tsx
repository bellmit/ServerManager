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
import { Tasks } from "srvmgr-api";
import { ProcessesService } from "./ProcessesService";

@Injectable
export class ListScheduledTasksComponent extends Component
{
    constructor(private processesService: ProcessesService)
    {
        super();

        this.tasks = null;
    }

    protected Render(): RenderValue
    {
        if(this.tasks === null)
            return <ProgressSpinner />;

        return <table>
            <tr>
                <th>Description</th>
                <th>Next schedule time</th>
                <th>Scheduler</th>
            </tr>
            {this.tasks.map(this.RenderTask.bind(this))}
        </table>;
    }

    //Private members
    private tasks: Tasks.TaskInfo[] | null;

    //Private methods
    private RenderTask(task: Tasks.TaskInfo)
    {
        return <tr>
            <td>{task.description}</td>
            <td>{new Date(task.nextScheduleTime).toLocaleString()}</td>
            <td>{task.type}</td>
        </tr>;
    }

    //Event handlers
    public async OnInitiated()
    {
        this.tasks = await this.processesService.QueryScheduledTasks();
    }
}