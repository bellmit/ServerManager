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
import {Component, JSX_CreateElement, RenderNode, FormField, LineEdit, Injectable, Router} from "acfrontend";
import { AuthenticationService } from "./Services/AuthenticationService";

@Injectable
export class LoginComponent extends Component
{
    constructor(private authenticationService: AuthenticationService, private router: Router)
    {
        super();

        this.userName = "";
        this.password = "";
        this.failed = false;
    }
    
    //Protected methods
    protected Render(): RenderNode
    {
        return <div class="box">
            <h1>Login</h1>
            <form onsubmit={this.OnLogin.bind(this)}>
                <FormField hint="Username">
                    <LineEdit value={this.userName} onChanged={newUserName => this.userName = newUserName}></LineEdit>
                </FormField>
                <FormField hint="Password">
                    <LineEdit value={this.password} password onChanged={newValue => this.password = newValue}></LineEdit>
                </FormField>
                <button>Login</button>
            </form>
            {this.RenderFailureMessage()}
        </div>;
    }

    //Private members
    private userName: string;
    private password: string;
    private failed: boolean;

    //Private methods
    private RenderFailureMessage()
    {
        if(this.failed)
        {
            return "Invalid login";
        }
        return null;
    }

    //Event handlers
    private async OnLogin(event: Event)
    {
        event.preventDefault();
        event.stopPropagation();
        
        if(await this.authenticationService.Login(this.userName, this.password))
        {
            const returnUrl = this.router.state.Get().queryParams.returnUrl || "/";
            this.router.RouteTo(returnUrl);
        }
        else
            this.failed = true;
    }
}