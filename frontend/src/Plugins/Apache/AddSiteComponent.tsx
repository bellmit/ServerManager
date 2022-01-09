/**
 * ServerManager
 * Copyright (C) 2022 Amir Czwink (amir130@hotmail.de)
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

import { Injectable, Component, JSX_CreateElement, Router } from "acfrontend";
import { Apache } from "srvmgr-api";
import { ObjectEditorComponent } from "../../ObjectEditorComponent";
import { ApacheService } from "./ApacheService";

@Injectable
export class AddSiteComponent extends Component
{
    constructor(private apacheService: ApacheService, private router: Router)
    {
        super();

        this.data = {
            addresses: "",
            customLog: "",
            directories: [],
            documentRoot: "",
            errorLog: "",
            serverAdmin: "",
            siteName: "",
        };
    }

    protected Render(): RenderValue
    {
        return <fragment>
            <h1>Add site</h1>
            <form onsubmit={this.OnSave.bind(this)}>
                <ObjectEditorComponent object={this.data} />
                <button type="submit">Save</button>
            </form>
        </fragment>;
    }

    //Private members
    private data: Apache.Api.SetSite.RequestData;

    //Event handlers
    private async OnSave(event: Event)
    {
        event.preventDefault();
        await this.apacheService.SetSite(this.data);
        this.router.RouteTo("/apache/sites");
    }
}