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

import { Component, FormField, JSX_CreateElement, LineEdit, Injectable, DialogRef } from "acfrontend";
import { UsersService } from "./UsersService";

@Injectable
export class ChangePasswordComponent extends Component
{
    input!: {
        userName: string;
    }

    constructor(private dialogRef: DialogRef, private usersService: UsersService)
    {
        super();

        this.oldPassword = "";
        this.newPassword = "";
        this.newPasswordConfirmation = "";
    }

    protected Render(): RenderValue
    {
        return <fragment>
            <FormField hint="Old password">
                <LineEdit value={this.oldPassword} password={true} onChanged={newValue => this.oldPassword = newValue}></LineEdit>
            </FormField>
            <FormField hint="New password">
                <LineEdit value={this.newPassword} password={true} onChanged={newValue => this.newPassword = newValue}></LineEdit>
            </FormField>
            <FormField hint="Confirm new password">
                <LineEdit value={this.newPasswordConfirmation} password={true} onChanged={newValue => this.newPasswordConfirmation = newValue}></LineEdit>
            </FormField>
        </fragment>;
    }

    //Private members
    private oldPassword: string;
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
        const result = await this.usersService.ChangePassword(this.input.userName, this.oldPassword, this.newPassword);
        if(result)
            this.dialogRef.Close();
        this.dialogRef.waiting.Set(false);
    }

    public OnInitiated()
    {
        this.dialogRef.onAccept.Subscribe(this.OnAccept.bind(this));
    }
}