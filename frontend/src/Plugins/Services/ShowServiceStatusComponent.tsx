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
import { Component, RenderNode, RouterState, Injectable, JSX_CreateElement, ProgressSpinner, MatIcon } from "acfrontend";
import { SystemServicesService } from "./SystemServicesService";

@Injectable
export class ShowServiceStatusComponent extends Component
{
    constructor(routerState: RouterState, private systemServicesService: SystemServicesService)
    {
        super();

        this.serviceName = routerState.routeParams.serviceName!;
        this.status = null;
    }

    protected Render(): RenderNode
    {
        if(this.status === null)
            return <ProgressSpinner />;

        return <fragment>
            <h1>Status of service: {this.serviceName} <a onclick={this.OnInitiated.bind(this)}><MatIcon>refresh</MatIcon></a></h1>
            <textarea cols="80" rows="44">{this.status}</textarea>
        </fragment>;
    }

    //Private members
    private serviceName: string;
    private status: string | null;

    //Event handlers
    public async OnInitiated()
    {
        this.status = null;
        this.status = await this.systemServicesService.QueryServiceStatus(this.serviceName);
    }
}