import axios from 'axios';
import { reactive } from 'vue';
import {provideApolloClient} from "@vue/apollo-composable";

class UploadManager {

    #echoClient

    #state

    constructor(echoClient) {
        this.#echoClient = echoClient;

        this.#state = reactive({
            isUploading: false,
            progress: 0,
            currentFile: null,
            files: [],
            failedFiles: []
        });
    }

    get isUploading() {
        return this.#state.isUploading;
    }

    get progress() {
        return this.#state.progress;
    }

    get currentFile() {
        return this.#state.currentFile;
    }

    get totalFiles() {
        return this.#state.files.length;
    }

    uploadFiles(addedFiles) {
        //Check if there's anything to upload
        if (addedFiles.length === 0) {
            return;
        }

        //Iterate over the array of files to add to the upload queue
        addedFiles.forEach(file => this.files.push(file));

        //Check if we're already uploading a file
        if (this.isUploading === true) {
            return;
        }

        //Start the upload of the first file
        this.uploadNextFile();
    }

    uploadNextFile() {
        //Grab the first file from the stack
        var currentFile = this.#state.files.shift();

        //TODO check if file is a valid media format

        //Update status variables
        this.resetStateVariables();

        //Set uploading status to true
        this.isUploading = true;
        this.#state.currentFile = currentFile.name;

        let formData = new FormData();
        formData.append("media", currentFile);

        //Upload the file
        axios.post("/api/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            onUploadProgress: () => {
                this.#state.progress = Math.round((100 * event.loaded) / event.total);
            }
        })
            .then(response => {
                console.log("upload response: ", response);
                //On success?
                //this.message = response.data.message;
            })
            .catch(error => {
                //Add the file to the failed uploads list to inform the user
                this.#state.failedFiles.push(Object.assign({
                        filename: currentFile.name,
                        message: ""
                    }, //Parse the error response to create appropriate status output
                    this.parseError(error.response)))
            })
            .finally(() => {
                //We're finished with all queued files
                this.isUploading = false;

                //Update status variables
                this.resetStateVariables();

                //Check if there are any remaining files to upload
                if (this.totalFiles > 0) {
                    //Start the upload of the next file.
                    this.uploadNextFile();
                }
            });
    }

    resetStateVariables() {
        this.#state.progress = 0;
        this.#state.currentFile = null;
    }

    parseError(error) {
        var code = error.status;

        //401: Unauthorized
        if (code === 401) {
            return {
                message: "You need to be logged in to upload files"
            };
        }
        //413: the payload is too large
        else if (code === 413) {
            return {
                message: "The file is too large"
            };
        }
        //500: internal server error
        else if (code === 500) {
            return {
                message: "An error occured while uploading, please try again later"
            };
        }

        //Unknown error
        return {
            message: "Unknown error"
        };
    }
}

export const UploadManagerPlugin = {
    install: (app, options) => {
        provideApolloClient(options.apolloClient);

        app.config.globalProperties.uploadManager = new UploadManager(options.echoClient);
    }
}
