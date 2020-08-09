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
import { Component, RenderNode, JSX_CreateElement, Router, Injectable } from "acfrontend";
import { ObjectEditorComponent } from "../../ObjectEditorComponent";
import { SMB } from "srvmgr-api";
import { SMBService } from "./SMBService";

@Injectable
export class ShareFormComponent extends Component<{
    oldShareName?: string;
    share: SMB.Share;
}>
{
    constructor(private smbService: SMBService, private router: Router)
    {
        super();
    }

    protected Render(): RenderNode
    {
        return <form onsubmit={this.OnSave.bind(this)}>
            <ObjectEditorComponent object={this.input.share} />
            <button type="submit">Save</button>
        </form>;
    }

    //Event handlers
    private async OnSave(event: Event)
    {
        event.preventDefault();

        await this.smbService.SetShare({ oldShareName: this.input.oldShareName, share: this.input.share });
        this.router.RouteTo("/smb/shares");
    }
}