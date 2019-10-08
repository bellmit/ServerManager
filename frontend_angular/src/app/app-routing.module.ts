import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './settings/settings.component';
import { StorageDevicesComponent } from './storage-devices/storage-devices.component';
import { PartitionsComponent } from './partitions/partitions.component';
import { FileExplorerComponent } from './file-explorer/file-explorer.component';

const routes: Routes = [
  { path: 'fileExplorer', component: FileExplorerComponent },
  { path: 'partitions/:devicePath', component: PartitionsComponent},
  { path: 'settings', component: SettingsComponent},
  { path: 'storageDevices', component: StorageDevicesComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
