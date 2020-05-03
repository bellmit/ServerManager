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
import { Injectable, Component, RenderNode, Router, JSX_CreateElement, ProgressSpinner } from "acfrontend";

import { DirectoryEntry, Routes } from "srvmgr-api";

import { BackupService } from "./BackupService";
import { BACKEND_HOST } from "../../Services/WebSocketService";

@Injectable
export class BackupListComponent extends Component
{
    constructor(router: Router, private backupService: BackupService)
    {
        super();

        this.backupName = router.state.Get().routeParams.backupName!;
        this.filesList = null;
    }

    //Protected methods
    protected Render(): RenderNode
    {
        return <fragment>
            <h1>Backups for: {this.backupName}</h1>
            {this.RenderFilesList()}
        </fragment>;
    }

    //Private members
    private backupName: string;
    private filesList: DirectoryEntry[] | null;

    //Private methods
    private RenderFilesList()
    {
        if(this.filesList === null)
            return <ProgressSpinner />;

        return <table>
            <tr>
                <th>Name</th>
                <th>Actions</th>
            </tr>
            {this.filesList.map(file => <tr>
                <td>{file.fileName}</td>
                <td>
                    <button onclick={this.OnDownload.bind(this, file.fileName)}>download</button>
                </td>
            </tr>)}
        </table>;
    }

    //Event handlers
    private async OnDownload(fileName: string)
    {
        const form = document.createElement("form");
        form.method = "post";
        form.action = "http://" + BACKEND_HOST + Routes.BACKUPS_DOWNLOAD;

        const args = {
            backupName: this.backupName,
            fileName: fileName
        };
        for (const key in args)
        {
            if (args.hasOwnProperty(key))
            {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = (args as any)[key];

                form.appendChild(input);
            }
        }

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    }

    public async OnInitiated()
    {
        this.filesList = await this.backupService.FetchBackups(this.backupName);
    }
}