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

import { Component, ProgressSpinner, JSX_CreateElement, Injectable, Anchor, MatIcon, RouterButton } from "acfrontend";
import { SMBService } from "./SMBService";
import { SMB } from "srvmgr-api";

@Injectable
export class ListSharesComponent extends Component
{
    constructor(private smbService: SMBService)
    {
        super();

        this.data = null;
    }

    //Protected methods
    protected Render(): RenderValue
    {
        if(this.data === null)
            return <ProgressSpinner />;

        return <fragment>
            <h1>SMB-Shares</h1>
            <table>
                <tr>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
                {this.data.map(this.RenderShare.bind(this))}
            </table>
            <div class="box">
                <RouterButton route="/smb/shares/add"><MatIcon>add</MatIcon></RouterButton>
            </div>
        </fragment>;
    }

    //Private members
    private data: SMB.Share[] | null;

    //Private methods
    private RenderShare(share: SMB.Share)
    {
        return <tr>
            <td>{share.name}</td>
            <td><Anchor route={"/smb/shares/edit/" + share.name}><MatIcon>edit</MatIcon></Anchor></td>
        </tr>;
    }

    //Event handlers
    public async OnInitiated()
    {
        this.data = await this.smbService.QueryShares();
        this.data.sort((a, b) => a.name.localeCompare(b.name));
    }
}