/**
 * ServerManager
 * Copyright (C) 2021 Amir Czwink (amir130@hotmail.de)
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

import { Component, JSX_CreateElement, Stack, StackChild, Tab, TabGroup, TabHeader } from "acfrontend";
import { ListScheduledTasksComponent } from "./ListScheduledTasksComponent";
import { ProcessListComponent } from "./ProcessListComponent";
import { ResourcesLoadComponent } from "./ResourcesLoadComponent";

export class SystemActivityMonitorComponent extends Component
{
    constructor()
    {
        super();
        this.activeKey = "resources";
    }
    
    protected Render(): RenderValue
    {
        return <fragment>
            <TabHeader>
                <TabGroup activeKey={this.activeKey} activeKeyChanged={newKey => this.activeKey = newKey}>
                    <Tab key="resources">Resources</Tab>
                    <Tab key="processes">Active processes</Tab>
                    <Tab key="tasks">Scheduled tasks</Tab>
                </TabGroup>
            </TabHeader>
            <Stack activeKey={this.activeKey}>
                <StackChild key="resources"><ResourcesLoadComponent /></StackChild>
                <StackChild key="processes"><ProcessListComponent /></StackChild>
                <StackChild key="tasks"><ListScheduledTasksComponent /></StackChild>
            </Stack>
        </fragment>;
    }

    //Private members
    private activeKey: string;
}