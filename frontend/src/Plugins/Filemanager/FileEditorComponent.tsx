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

import { Component, Injectable, JSX_CreateElement, ProgressSpinner, Router, Textarea } from "acfrontend";
import { FileSystemService } from "./FileSystemService";

@Injectable
export class FileEditorComponent extends Component<{ path: string; }>
{
    constructor(private fileSystemService: FileSystemService, private router: Router)
    {
        super();

        this.data = null;
    }

    protected Render(): RenderValue
    {
        if(this.data === null)
            return <ProgressSpinner />;

        return <fragment>
            <Textarea value={this.data} onChanged={newValue => this.data = newValue} />
            <button type="button" onclick={this.OnSave.bind(this)}>Save</button>
        </fragment>;
    }

    //Private members
    private data: string | null;

    //Event handlers
    public async OnInitiated()
    {
        this.data = await this.fileSystemService.QueryFileContent(this.input.path);
    }

    private async OnSave()
    {
        const content = this.data!;
        this.data = null;

        await this.fileSystemService.SetFileContent({
            path: this.input.path,
            content
        });

        const parentPath = this.input.path.substring(0, this.input.path.lastIndexOf("/"));
        this.router.RouteTo("/filemanager?path=" + parentPath);
    }
}