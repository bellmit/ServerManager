/**
 * ServerManager
 * Copyright (C) 2020-2021 Amir Czwink (amir130@hotmail.de)
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
import { Injectable, Component, Router, JSX_CreateElement, ProgressSpinner } from "acfrontend";
import { FileDownloadService } from "../../Services/FileDownloadService";


import { BackupService, DirectoryEntry } from "./BackupService";

@Injectable
export class BackupListComponent extends Component
{
    constructor(router: Router, private backupService: BackupService, private fileDownloadService: FileDownloadService)
    {
        super();

        this.backupName = router.state.Get().routeParams.backupName!;
        this.filesList = null;
    }

    //Protected methods
    protected Render(): RenderValue
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
                    <button type="button" onclick={this.OnDownload.bind(this, file.fileName)}>download</button>
                </td>
            </tr>)}
        </table>;
    }

    //Event handlers
    private async OnDownload(fileName: string)
    {
        const blob = await this.backupService.DownloadFile(this.backupName, fileName);

        this.fileDownloadService.DownloadBlobAsFile(blob, fileName);
    }

    public async OnInitiated()
    {
        this.filesList = await this.backupService.FetchBackups(this.backupName);
    }
}