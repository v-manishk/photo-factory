import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

@Component({
    selector: 'upload-task',
    templateUrl: './upload-task.component.html',
    styleUrls: ['./upload-task.component.css']
})
export class UploadTaskComponent implements OnChanges {

    @Input('files') files: any;
    task: AngularFireUploadTask;                                        // this does the uploading for us

    percentage: Observable<number | undefined>;
    snapshot: Observable<any>;
    downloadURL: string;

    constructor(private storage: AngularFireStorage, private db: AngularFirestore) {  }

    ngOnInit(): void {
      //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
      //Add 'implements AfterViewInit' to the class.
      this.files?.forEach((file:any) => {
        this.startUpload(file);
      });
    }

    ngOnChanges(changes: SimpleChanges): void {
      //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
      //Add '${implements OnChanges}' to the class.
      if(changes.files.currentValue !== changes.files.previousValue){

        this.files = changes.files.currentValue;
        this.files?.forEach((file:any) => {
          this.startUpload(file);
        });
      }
    }

    startUpload(file:any) {
      if(!file){
        return;
      }
        console.log('uploading file', file);

        let safeName = file.name.replace(/([^a-z0-9.]+)/gi, '');   // file name stripped of spaces and special chars
        let timestamp = Date.now();                                     // ex: '1598066351161'
        const uniqueSafeName = timestamp + '_' + safeName;
        const path = 'uploads/' + uniqueSafeName;                       // Firebase storage path
        const ref = this.storage.ref(path);                             // reference to storage bucket

        this.task = this.storage.upload(path, file);
        this.percentage = this.task.percentageChanges();                // progress monitoring
        this.snapshot = this.task.snapshotChanges().pipe(               // emits a snapshot of the transfer progress every few hundred milliseconds
            tap(console.log),
            finalize(async () => {                                      // after the observable completes, get the file's download URL
                this.downloadURL = await ref.getDownloadURL().toPromise();

                this.db.collection('files').doc(uniqueSafeName).set({
                    storagePath: path,
                    downloadURL: this.downloadURL,
                    originalName: file.name,
                    timestamp: timestamp
                })
                    .then(function () {
                        console.log('document written!');
                    })
                    .catch(function (error) {
                        console.error('Error writing document:', error);
                    });
            }),
        );
    }

    isActive(snapshot: any) {
        return (snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes);
    }

}
