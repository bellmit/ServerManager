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
import { OpenVPNService } from "./OpenVPNService";

@Injectable
export class AddCADirComponent extends Component
{
    constructor(private notificationsService: NotificationsService, private openvpnService: OpenVPNService)
    {
        super();

        this.data = null;
        this.dhPid = null;
    }

    //Protected methods
    protected Render(): RenderNode
    {
        if(this.dhPid !== null)
        {
            return <fragment>
                <ProgressSpinner />
                <br />
                Waiting for process {this.dhPid}, which may take a while.
                Please be patient.
                This site does not update itself! Please check the terminal.
            </fragment>;
        }

        if(this.data === null)
            return <ProgressSpinner />;

        return <fragment>
            <h1>Create new certificate authority</h1>
            <ObjectEditorComponent object={this.data} onObjectUpdated={this.Update.bind(this)} />

            <button disabled={!(ObjectValidator.Validate(this.data) && this.Validate())} type="button" onclick={this.OnCreate.bind(this)}>Create</button>
        </fragment>
    }

    //Private members
    private data: OpenVPNApi.AddCA.RequestData | null;
    private dhPid: number | null;

    //Private methods
    private Validate()
    {
        const data = this.data!;

        return (data.countryCode.trim().length === 2);
    }

    //Event handlers
    private async OnCreate()
    {
        const data = this.data!;
        this.data = null;

        this.dhPid = await this.openvpnService.CreateCADir(data);
    }

    public async OnInitiated()
    {
        const settings = await this.notificationsService.QuerySettings();

        this.data = {
            city: "",
            countryCode: "US",
            email: settings.email,
            keySize: 2048,
            name: "",
            organization: "",
            organizationalUnit: "",
            province: "",
            domainName: "",
        };
    }
}