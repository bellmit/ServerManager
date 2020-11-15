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
import { Component, JSX_CreateElement, FormField, LineEdit, DialogRef, Injectable, Select, ProgressSpinner } from "acfrontend";
import { SMBService } from "./SMBService";
import { UsersService } from "../Users/UsersService";

@Injectable
export class AddSMBUserComponent extends Component
{
    constructor(private dialogRef: DialogRef, private smbService: SMBService, private usersService: UsersService)
    {
        super();

        this.userNames = null;
        this.userName = "";
        this.newPassword = "";
        this.newPasswordConfirmation = "";
    }

    protected Render(): RenderValue
    {
        if(this.userNames === null)
            return <ProgressSpinner />;

        return <fragment>
            <Select onChanged={newSelection => this.userName = newSelection[0]}>
                {...this.userNames.map(userName => <option selected={this.userName === userName}>{userName}</option>)}
            </Select>
            <FormField hint="Password">
                <LineEdit value={this.newPassword} password={true} onChanged={newValue => this.newPassword = newValue}></LineEdit>
            </FormField>
            <FormField hint="Confirm password">
                <LineEdit value={this.newPasswordConfirmation} password={true} onChanged={newValue => this.newPasswordConfirmation = newValue}></LineEdit>
            </FormField>
        </fragment>;
    }

    //Private members
    private userNames: string[] | null;
    private userName: string;
    private newPassword: string;
    private newPasswordConfirmation: string;

    //Event handlers
    private async OnAccept()
    {
        if(this.newPassword !== this.newPasswordConfirmation)
        {
            alert("Passwords do not match");
            return;
        }

        this.dialogRef.waiting.Set(true);
        const result = await this.smbService.AddUser({ password: this.newPassword, userName: this.userName });
        if(result)
            this.dialogRef.Close();
        this.dialogRef.waiting.Set(false);
    }

    public async OnInitiated()
    {
        this.dialogRef.onAccept.Subscribe(this.OnAccept.bind(this));

        const smbUsers = await this.smbService.QueryUsers();
        const smbUserNames = smbUsers.map(smbUser => smbUser.name);
        this.usersService.users.Subscribe(users => {
            this.userNames = users.filter(user => !smbUserNames.Contains(user.name)).map(user => user.name);
            this.userNames.sort();
            this.userName = this.userNames[0] || "";
        });
    }
}