import { OAuth2 } from "../../OAuth2";
import { SlackRoomStore } from "../../SlackRoomStore";
import { FakeDatastore } from "./fakeDatastore";
import { TeamEntry, UserEntry } from "../../datastore/Models";
import { FakeIntent } from "./fakeIntent";
import { SlackGhost } from "../../SlackGhost";
import { Main } from "../../Main";

const DEFAULT_OPTS = {
    oauth2: false,
};

interface Opts {
    oauth2: boolean;
    teams?: TeamEntry[];
    usersInTeam?: UserEntry[];
}

export class FakeMain {
    public oauth2?: OAuth2;
    public rooms: SlackRoomStore = new SlackRoomStore();
    public datastore: FakeDatastore;
    constructor(opts: Opts = DEFAULT_OPTS) {
        if (opts.oauth2) {
            this.oauth2 = new OAuth2({
                // tslint:disable-next-line: no-any
                main: this as any,
                client_id: "fakeid",
                client_secret: "fakesecret",
                redirect_prefix: "redir_prefix",
            });
        }
        this.datastore = new FakeDatastore(opts.teams, opts.usersInTeam);
    }
    public readonly timerFinished: {[eventName: string]: string } = {};
    public readonly counters: {[type: string]: [{side: string}] } = {};

    public clientFactory: FakeClientFactory = new FakeClientFactory();

    public startTimer(eventName: string) {
        this.timerFinished[eventName] = "notfinished";
        return (reason: {outcome: string}) => {
            this.timerFinished[eventName] = reason.outcome;
        };
    }

    public incCounter(type: string, data: {side: string}): void {
        this.counters[type] = (this.counters[type] || []);
        this.counters[type].push(data);
    }

    public get botIntent() {
        return new FakeIntent();
    }

    public async getExistingSlackGhost(userId: string) {
        if (userId === "@stranger:localhost") {
            return new SlackGhost(this as unknown as Main, "12345", undefined, "@stranger:localhost");
        }
        if (userId === "@thing:localhost") {
            return new SlackGhost(this as unknown as Main, "54321", undefined, "@thing:localhost");
        }
        return null;
    }
}

class FakeClientFactory {
    public async getClientForUser(teamId: string, matrixId: string) {
        return {};
    }
}
