import { Component, RenderNode, JSX_CreateElement, TabHeader, Tab, Stack, StackChild, TabGroup } from "acfrontend";
import { UserListComponent } from "./UserListComponent";
import { GroupListComponent } from "./GroupListComponent";

export class UsersAndGroupsComponent extends Component
{
    constructor()
    {
        super();
        this.activeKey = "users";
    }
    
    protected Render(): RenderNode
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