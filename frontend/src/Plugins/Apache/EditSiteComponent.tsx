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

import { Injectable, Component, RenderNode, ProgressSpinner, JSX_CreateElement, RouterState } from "acfrontend";
import { Apache } from "srvmgr-api";
import { ApacheService } from "./ApacheService";
import { ObjectEditorComponent } from "../../ObjectEditorComponent";

@Injectable
export class EditSiteComponent extends Component
{
    constructor(private apacheService: ApacheService, routerState: RouterState)
    {
        super();

        this.siteName = routerState.routeParams.siteName!;
        this.data = null;

        this.mod_ssl = {
            certificateFile: "",
            keyFile: "",
        };
    }

    protected Render(): RenderNode
    {
        if(this.data === null)
            return <ProgressSpinner />;

        return <fragment>
            <h1>Edit site {this.siteName}</h1>
            <form onsubmit={this.OnSave.bind(this)}>
                <ObjectEditorComponent object={this.data} />
                {this.data.mod_ssl === undefined ?
                    <fragment>
                        <h2>SSL</h2>
                        <ObjectEditorComponent object={this.mod_ssl} />
                    </fragment>
                : ""}
                <button type="submit">Save</button>
            </form>
        </fragment>;
    }
    
    //Private members
    private siteName: string;
    private data: Apache.Api.QuerySite.ResultData | null;
    private mod_ssl: Apache.SSLModuleProperties;

    //Event handlers
    public async OnInitiated()
    {
        this.data = await this.apacheService.QuerySite(this.siteName);
    }

    private async OnSave(event: Event)
    {
        event.preventDefault();

        const data = this.data!;
        this.data = null;

        if(data.mod_ssl === undefined)
        {
            if( (this.mod_ssl.certificateFile.trim().length > 0) && (this.mod_ssl.keyFile.trim().length > 0) )
            {
                data.mod_ssl = this.mod_ssl;
            }
        }

        const requestData = data.DeepClone() as Apache.Api.SetSite.RequestData;
        requestData.siteName = this.siteName;
        await this.apacheService.SetSite(requestData);
        this.data = data;
    }
}