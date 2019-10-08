import {App, Component, JSX_CreateElement, VirtualNode} from "acfrontend";

class RootComponent extends Component
{
    protected Render(): VirtualNode
    {
        return <h1>Bootstrapping worked!</h1>;
    }
}

const app = new App({
    mountPoint: document.body,
    rootComponentClass: RootComponent
});