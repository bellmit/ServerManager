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

import { Injectable, Component, RenderNode, JSX_CreateElement, ProgressSpinner, Textarea } from "acfrontend";
import { ApacheService } from "./ApacheService";

@Injectable
export class PortsComponent extends Component
{
    constructor(private apacheService: ApacheService)
    {
        super();

        this.data = null;
    }
    
    protected Render(): RenderNode
    {
        if(this.data === null)
            return <ProgressSpinner />;

        return <fragment>
            <Textarea value={this.data} onChanged={newValue => this.data = newValue} />
            <button type="button" onclick={this.OnSave.bind(this)}>Save</button>
        </fragment>;
    }

    //Private members
    private data: string | null;

    //Event handlers
    public async OnInitiated()
    {
        this.data = await this.apacheService.QueryPorts();
    }

    private async OnSave()
    {
        const data = this.data;
        this.data = null;

        await this.apacheService.SetPorts(data!);

        this.data = data;
    }
}