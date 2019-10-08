import express from "express";
import cors from "cors";

import { CommandExecutor } from "./services/CommandExecutor";
import { DeviceInfo, StorageDevicesManager } from "./services/StorageDevicesManager";
import { Injector } from "./Injector";
import { FileSystemManager } from "./services/FileSystemManager";

const port = 8080;

//register services
const commandExecutor = new CommandExecutor();
Injector.Register("CommandExecutor", commandExecutor);
Injector.Register("FileSystemManager", new FileSystemManager);
Injector.Register("StorageDevicesManager", new StorageDevicesManager(commandExecutor));


//setup app
const app = express();

//enable requests from frontend
var corsOptions = {
    origin: 'http://localhost',
    optionsSuccessStatus: 200
}
app.use(cors());

const intialDevices: DeviceInfo[] = [];
const state = {
    "devices": intialDevices,
};

//register routes
app.get("/listDir/:path", (req, res) => {
    const path = req.params.path;
    const mgr = Injector.Resolve<FileSystemManager>("FileSystemManager");
    res.json(mgr.ReadDirectory(path));
});

app.get("/partitions/:devicePath", (req, res) => {
    let dev = state.devices.find( dev => dev.path == req.params.devicePath);
    if(dev !== undefined)
        res.json(dev.partitions);
    else
        res.json({});
});

app.get("/storageDevices", (req, res) => {
    res.json(state.devices);
});


//initialize app and then run
async function Initialize()
{
    state.devices = await Injector.Resolve<StorageDevicesManager>("StorageDevicesManager").QueryDevices();
}

async function Run()
{
    await Initialize();
    app.listen(port, () => {
        console.log("Server is running...");
    });
}

Run();