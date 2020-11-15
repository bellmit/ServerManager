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

import { Component, Injectable, JSX_CreateElement, ProgressSpinner, Router } from "acfrontend";
import { OpenVPNApi } from "srvmgr-api";
import { ObjectEditorComponent } from "../../ObjectEditorComponent";
import { ObjectValidator } from "../../ObjectValidator";
import { OpenVPNService } from "./OpenVPNService";

@Injectable
export class AddConfigComponent extends Component
{
    constructor(private openVPNService: OpenVPNService, private router: Router)
    {
        super();

        this.data = {
            authenticationAlgorithm: "SHA256",
            cipher: "AES-256-CBC",
            name: "",
            port: 1194,
            protocol: "tcp",
            verbosity: 3,
            virtualServerAddress: "",
            virtualServerSubnetMask: "",
            certKeyFiles: {
                caCertPath: "/etc/easy-rsa/",
                certPath: "/etc/easy-rsa/",
                dhPath: "/etc/easy-rsa/",
                keyPath: "/etc/easy-rsa/",
            }
        };
        this.saving = false;
    }
    
    protected Render(): RenderValue
    {
        if(this.saving)
            return <ProgressSpinner />;

        return <fragment>
            <ObjectEditorComponent object={this.data} onObjectUpdated={this.Update.bind(this)} />
            <button type="button" disabled={!ObjectValidator.Validate(this.data)} onclick={this.OnCreate.bind(this)}>Create</button>
        </fragment>;
    }

    //Private members
    private data: OpenVPNApi.AddConfig.RequestData;
    private saving: boolean;

    //Event handlers
    private async OnCreate()
    {
        this.saving = true;
        await this.openVPNService.AddConfig(this.data);
        this.saving = false;
        
        this.router.RouteTo("/openvpn/");
    }
}