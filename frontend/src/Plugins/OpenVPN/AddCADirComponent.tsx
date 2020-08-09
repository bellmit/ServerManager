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
import { Component, RenderNode, JSX_CreateElement, ProgressSpinner, Injectable } from "acfrontend";
import { OpenVPNApi } from "srvmgr-api";
import { ObjectEditorComponent } from "../../ObjectEditorComponent";
import { NotificationsService } from "../Notifications/NotificationsService";
import { ObjectValidator } from "../../ObjectValidator";

@Injectable
export class AddCADirComponent extends Component
{
    constructor(private notificationsService: NotificationsService)
    {
        super();

        this.data = null;
    }

    //Protected methods
    protected Render(): RenderNode
    {
        if(this.data === null)
            return <ProgressSpinner />;

        return <fragment>
            <h1>Create new certificate authority</h1>
            <ObjectEditorComponent object={this.data} onObjectUpdated={this.Update.bind(this)} />

            <button disabled={!ObjectValidator.Validate(this.data)} type="button">Create</button>
        </fragment>
    }

    //Private members
    private data: OpenVPNApi.AddCA.RequestData | null;

    //Event handlers
    public async OnInitiated()
    {
        const settings = await this.notificationsService.QuerySettings();

        this.data = {
            city: "",
            country: "",
            email: settings.email,
            keySize: 2048,
            name: "",
            organization: "",
            organizationalUnit: "",
            province: "",
        };
    }
}