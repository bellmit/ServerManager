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
import { Injectable, Component, RenderNode, JSX_CreateElement, Anchor, MatIcon, RouterButton } from "acfrontend";
import { BackupTask } from "srvmgr-api";

import { BackupService } from "./BackupService";

@Injectable
export class BackupListComponent extends Component
{
    constructor(private backupService: BackupService)
    {
        super();

        this.backupService.backups.Subscribe( (newBackups: BackupTask[]) => this.backups = newBackups );
        this.backups = this.backupService.backups.Get();
    }

    //Protected methods
    protected Render(): RenderNode
    {
        return <fragment>
            <h1>Backups</h1>
            <table>
                <tr>
                    <th>Name</th>
                    <th>Enabled</th>
                    <th>Actions</th>
                </tr>
                {this.RenderBackupsList()}
            </table>
            <div class="row">
                <RouterButton route="/backup/add"><MatIcon>add</MatIcon></RouterButton>
            </div>
        </fragment>
    }

    //Private members
    private backups: BackupTask[];

    //Private methods
    private RenderBackupsList()
    {
        return this.backups.map(backup => <tr>
            <td>{backup.name}</td>
            <td>{backup.enabled ? "Yes" : "No"}</td>
            <td>
                <Anchor route={"/backup/edit/" + backup.name}>edit</Anchor> |
                <a onclick={this.OnBackupNowClicked.bind(this, backup.name)}>run now</a> |
                <a onclick={this.OnDeleteActivated.bind(this, backup.name)}>delete</a>
            </td>
        </tr>);
    }

    //Event handlers
    private OnBackupNowClicked(backupName: string)
    {
        if(confirm("Are you sure that you want to run this backup task now?"))
            this.backupService.RunBackup(backupName);
    }

    private OnDeleteActivated(backupName: string)
    {
        if(confirm("Are you sure that you want to delete this backup job?"))
            this.backupService.DeleteBackup(backupName);
    }
}