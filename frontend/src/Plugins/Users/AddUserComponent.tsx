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
import { Component, JSX_CreateElement, FormField, LineEdit, DialogRef, Injectable, CheckBox } from "acfrontend";
import { UsersService } from "./UsersService";

@Injectable
export class AddUserComponent extends Component
{
    constructor(private dialogRef: DialogRef, private usersService: UsersService)
    {
        super();
        this.userName = "";
        this.createHomeDir = false;
    }

    protected Render(): RenderValue
    {
        return <fragment>
            <FormField hint="Username">
                <LineEdit value={this.userName} onChanged={newUserName => this.userName = newUserName}></LineEdit>
            </FormField>
            <FormField hint="Create home-directory">
                <CheckBox value={this.createHomeDir} onChanged={newValue => this.createHomeDir = newValue} />
            </FormField>
        </fragment>;
    }

    //Private members
    private userName: string;
    private createHomeDir: boolean;

    //Event handlers
    private async OnAccept()
    {
        if(this.userName.length > 0)
        {
            this.dialogRef.waiting.Set(true);
            const result = await this.usersService.AddUser(this.userName, this.createHomeDir);
            if(result)
                this.dialogRef.Close();
            this.dialogRef.waiting.Set(false);
        }
        else
        {
            alert("Username is empty");
        }
    }

    public OnInitiated()
    {
        this.dialogRef.onAccept.Subscribe(this.OnAccept.bind(this));
    }
}