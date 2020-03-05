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
import { Injectable, Component, RenderNode, JSX_CreateElement, Anchor, MatIcon, Router, RouterButton } from "acfrontend";

import { ExternalConnectionConfig } from "srvmgr-api";

import { ExternalConnectionsService } from "./ExternalConnectionsService";

@Injectable
export class ExternalConnectionsListComponent extends Component
{
    constructor(private externalConnectionsService: ExternalConnectionsService, private router: Router)
    {
        super();

        this.connections = [];
        this.externalConnectionsService.connections.Subscribe( (newConnections) => this.connections = newConnections);
    }

    //Protected methods
    protected Render(): RenderNode
    {
        return <fragment>
            <h1>External Connections</h1>
            <table>
                <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Actions</th>
                </tr>
                {this.RenderConnectionsList()}
            </table>
            <div class="row">
                <RouterButton route="/externalconnections/add"><MatIcon>add</MatIcon></RouterButton>
            </div>
        </fragment>;
    }

    //Private members
    private connections: ExternalConnectionConfig[];

    //Private methods
    private RenderConnectionsList()
    {
        return this.connections.map(connection => <tr>
            <td>{connection.name}</td>
            <td>{connection.type}</td>
            <td>
                <Anchor route={"/externalconnections/edit/" + connection.name}>edit</Anchor>
                <button onclick={this.OnDeleteActivated.bind(this, connection.name)}>delete</button>
            </td>
        </tr>);
    }

    //Event handlers
    private OnDeleteActivated(connectionName: string)
    {
        if(confirm("Are you sure that you want to delete this external connection?\nNOTE: IN CASE YOU'VE USED ENCRYPTION, BACKUP YOUR ServerManager.json CONFIG FILE OR YOU CAN NOT DECRYPT THE BACKUP FILES EVER AGAIN!!!"))
        {
            if(confirm("Are you REALLY sure?"))
                this.externalConnectionsService.DeleteConnection(connectionName);
        }
    }
}