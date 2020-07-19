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
import { Injectable, Component, RenderNode, ProgressSpinner, JSX_CreateElement, MatIcon } from "acfrontend";
import { SystemServicesService } from "./SystemServicesService";
import { SystemService, SystemServiceAction } from "srvmgr-api";

@Injectable
export class ListServicesComponent extends Component
{
    constructor(private systemServicesService: SystemServicesService)
    {
        super();

        this.data = null;
    }
    
    protected Render(): RenderNode
    {
        if(this.data === null)
            return <ProgressSpinner />;

        return <table>
            <tr>
                <th>Service</th>
                <th>Running</th>
                <th>Actions</th>
            </tr>
            {...this.data.map(this.RenderServiceRow.bind(this))}
        </table>;
    }

    //Private members
    private data: SystemService[] | null;

    //Private methods
    private RenderServiceRow(systemService: SystemService)
    {
        return <tr>
            <td>{systemService.name}</td>
            <td>{systemService.running ? <MatIcon>check</MatIcon> : ""}</td>
            <td>
                <button disabled={systemService.running} type="button" title="Start" onclick={this.OnServiceActionClicked.bind(this, systemService.name, "start")}><MatIcon>play_arrow</MatIcon></button>
                <button disabled={!systemService.running} type="button" class="danger" title="Stop" onclick={this.OnServiceActionClicked.bind(this, systemService.name, "stop")}><MatIcon>stop</MatIcon></button>
                <button disabled={!systemService.running} type="button" title="Restart" onclick={this.OnServiceActionClicked.bind(this, systemService.name, "restart")}><MatIcon>refresh</MatIcon></button>
            </td>
        </tr>;
    }

    //Event handlers
    public async OnInitiated()
    {
        this.data = await this.systemServicesService.ListSystemServices();
    }

    private async OnServiceActionClicked(serviceName: string, serviceAction: SystemServiceAction)
    {
        this.data = null;

        await this.systemServicesService.ExecuteAction(serviceName, serviceAction);

        this.data = await this.systemServicesService.ListSystemServices();
    }
}