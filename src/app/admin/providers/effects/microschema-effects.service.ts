import { Injectable } from '@angular/core';

import { ApiService } from '../../../core/providers/api/api.service';
import { I18nNotification } from '../../../core/providers/i18n-notification/i18n-notification.service';
import { ApplicationStateService } from '../../../state/providers/application-state.service';
import { MicroschemaUpdateRequest, MicroschemaCreateRequest } from '../../../common/models/server-models';


@Injectable()
export class MicroschemaEffectsService {

    constructor(private api: ApiService,
                private state: ApplicationStateService,
                private notification: I18nNotification) {
    }

    loadMicroschemas() {
        this.state.actions.list.fetchMicroschemasStart();
        this.api.admin.getMicroschemas({})
        .subscribe(microschemas => {
            this.state.actions.list.fetchMicroschemasSuccess(microschemas.data);
        }, error => {
            this.state.actions.list.fetchMicroschemasError();
        });
    }

    loadMicroschema(microschemaUuid: string) {
        this.state.actions.list.fetchMicroschemaStart();
        this.api.admin.getMicroschema({microschemaUuid})
        .subscribe(microschema => {
            this.state.actions.list.fetchMicroschemaSuccess(microschema);
        }, error => {
            this.state.actions.list.fetchMicroschemaError();
        });
    }

    updateMicroschema(request: MicroschemaUpdateRequest & {uuid: string}) {
        this.state.actions.admin.actionStart();
        this.api.admin.updateMicroschema({microschemaUuid: request.uuid}, request)
        .subscribe(() => {
            this.loadMicroschema(request.uuid);
            this.state.actions.admin.actionSuccess();
            this.notification.show({
                type: 'success',
                message: 'admin.microschema_updated'
            });
        }, error => {
            this.state.actions.admin.actionError();
        });
    }
}
