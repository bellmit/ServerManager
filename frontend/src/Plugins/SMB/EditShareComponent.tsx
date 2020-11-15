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
import { Component, Injectable, JSX_CreateElement, RouterState, ProgressSpinner } from "acfrontend";
import { ShareFormComponent } from "./ShareFormComponent";
import { SMBService } from "./SMBService";
import { SMB } from "srvmgr-api";

@Injectable
export class EditShareComponent extends Component
{
    constructor(routerState: RouterState, private smbService: SMBService)
    {
        super();

        this.oldShareName = routerState.routeParams.shareName!;
        this.share = null;
    }

    protected Render(): RenderValue
    {
        if(this.share === null)
            return <ProgressSpinner />;

        return <fragment>
            <h1>Edit share {this.oldShareName}</h1>
            <ShareFormComponent oldShareName={this.oldShareName} share={this.share} />
        </fragment>;
    }

    //Private members
    private oldShareName: string;
    private share: SMB.Share | null;

    //Event handlers
    public async OnInitiated()
    {
        const shares = await this.smbService.QueryShares();
        this.share = shares.find(share => share.name === this.oldShareName)!;
    }
}