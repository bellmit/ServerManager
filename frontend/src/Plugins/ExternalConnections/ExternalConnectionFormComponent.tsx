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
import { Injectable, Component, RenderNode, JSX_CreateElement, ProgressSpinner, CheckBox, LineEdit, Router, Select } from "acfrontend";

import { ExternalConnectionConfig, ExternalConnectionTypes, ExternalConnectionType } from "srvmgr-api";

import { ExternalConnectionsService } from "./ExternalConnectionsService";
import { WebDavComponent } from "./WebDavComponent";
import { FilesystemComponent } from "./FilesystemComponent";

@Injectable
export class ExternalConnectionFormComponent extends Component
{
    input!: {
        connectionName?: string;
    }

    constructor(private externalConnectionService: ExternalConnectionsService, private router: Router)
    {
        super();

        this.waiting = true;
        this.encrypt = false;

        this.connection = {
            name: "",
            type: ExternalConnectionTypes[0]
        };
    }

    //Protected methods
    protected Render(): RenderNode
    {
        if(this.waiting)
            return <ProgressSpinner />;
            
        return <table class="keyValue">
            <tr>
                <th>Name</th>
                <td><LineEdit value={this.connection.name} onChanged={newValue => this.connection!.name = newValue} /></td>
            </tr>
            <tr>
                <th>Type</th>
                <td>
                    <Select onChanged={this.OnTypeChanged.bind(this)}>{this.RenderTypes()}</Select>
                </td>
            </tr>
            {this.RenderTypeOptions()}
            <tr>
                <th>Encrypt files</th>
                <td><CheckBox value={this.encrypt} onChanged={this.OnEncryptionToggled.bind(this)} /></td>
            </tr>
            <tr>
                <td><button onclick={this.OnSave.bind(this)}>Save</button></td>
            </tr>
        </table>;
    }

    //Private members
    private waiting: boolean;
    private connection: ExternalConnectionConfig;
    private encrypt: boolean;

    //Private methods
    private RenderTypeOptions()
    {
        switch(this.connection!.type)
        {
            case "file":
                return <FilesystemComponent options={this.connection!.options!} />;
            case "webdav":
                return <WebDavComponent options={this.connection!.options!} />;
        }
    }

    private RenderTypes()
    {
        return ExternalConnectionTypes.map( type => <option selected={type === this.connection.type}>{type}</option>);
    }

    //Event handlers
    private OnEncryptionToggled(newValue: boolean)
    {
        const warningMsg = "\nWARNING: The ServerManager.json file contains the neccessary encryption information for the stored files. If this file gets lost, broken or whatever, YOU WON'T BE ABLE TO DECRYPT ANY FILE WHATSOEVER STORED ON THIS EXTERNAL CONNECTION!!!";
        if(newValue)
        {
            alert("Backup your ServerManager.json config file!" + warningMsg);
            this.encrypt = true;
        }
        else
        {
            if(confirm("Are you sure of what you are doing? This will PERMANENTLY delete the encryption information from your ServerManager.json" + warningMsg))
                this.encrypt = false;
            else
                this.Update();
        }
    }

    public OnInitiated()
    {
        if(this.input.connectionName === undefined)
        {
            this.connection.options = {};
            this.waiting = false;
        }
        else
        {
            this.externalConnectionService.connections.Subscribe( async newConnections => {
                const fetchedConnection = newConnections.find( connection => connection.name === this.input.connectionName);
                if(fetchedConnection !== undefined)
                {
                    this.connection = fetchedConnection;
                    this.encrypt = await this.externalConnectionService.IsEncrypted(this.connection.name);
                    this.waiting = false;
                }
            });
        }
    }

    private async OnSave()
    {
        this.waiting = true;
        const result = await this.externalConnectionService.SetConnection(this.input.connectionName, this.connection!, this.encrypt);
        if(!result)
        {
            alert("TODO: ERROR");
        }
        this.router.RouteTo("/externalconnections");
    }

    private OnTypeChanged(newValues: string[])
    {
        this.connection!.options = {};
        this.connection!.type = newValues[0] as ExternalConnectionType;
        this.Update();
    }
}