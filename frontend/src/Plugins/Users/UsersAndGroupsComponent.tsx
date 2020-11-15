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
import { Component, JSX_CreateElement, TabHeader, Tab, Stack, StackChild, TabGroup } from "acfrontend";
import { UserListComponent } from "./UserListComponent";
import { GroupListComponent } from "./GroupListComponent";

export class UsersAndGroupsComponent extends Component
{
    constructor()
    {
        super();
        this.activeKey = "users";
    }
    
    protected Render(): RenderValue
    {
        return <fragment>
            <TabHeader>
                <TabGroup activeKey={this.activeKey} activeKeyChanged={newKey => this.activeKey = newKey}>
                    <Tab key="users">Users</Tab>
                    <Tab key="systemUsers">System users</Tab>
                    <Tab key="groups">Groups</Tab>
                </TabGroup>
            </TabHeader>
            <Stack activeKey={this.activeKey}>
                <StackChild key="users"><UserListComponent showSystemUsers={false} /></StackChild>
                <StackChild key="systemUsers"><UserListComponent showSystemUsers={true} /></StackChild>
                <StackChild key="groups"><GroupListComponent /></StackChild>
            </Stack>
        </fragment>;
    }

    //Private members
    private activeKey: string;
}